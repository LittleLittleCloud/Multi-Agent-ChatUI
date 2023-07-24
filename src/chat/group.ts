import { AgentProvider } from "@/agent/agentProvider";
import { IAgent } from "@/agent/type";
import { IGroup } from "@/chat/type";
import { IMarkdownMessage } from "@/message/MarkdownMessage";
import { IMessage, IsUserMessage } from "@/message/type";

export class MultiAgentGroup{
    user: IAgent;

    system: IAgent = {
        type: 'agent.chat',
        alias: "System",
        description: "determine when to terminate the conversation",
    } as IAgent;

    public ASK_USER_MESSAGE: IMessage;

    TERMINATE_MESSAGE: IMarkdownMessage = {
        from: this.system.alias,
        content: "// terminate the conversation",
        type: 'message.markdown',
    };

    public agents: IAgent[];
    public conversation: IMessage[];
    
    constructor(user: IAgent, agents: IAgent[], conversation: IMessage[]){
        this.agents = agents;
        this.conversation = conversation;
        this.user = user;
        this.ASK_USER_MESSAGE = {
            from: this.user.alias,
            content: "// ask user for his response",
            type: 'message.markdown',
        };
    }

    public async getRoleDescription(): Promise<{alias: string, description: string}[]>{
        var agent_list = [...this.agents];
        var descriptions: {alias: string, description: string}[] = [];
        for(var agent of agent_list){
            var agentExecutor = AgentProvider.getProvider(agent)(agent);
            var description = await agentExecutor.describleRole(this.conversation);
            descriptions.push({
                alias: agent.alias,
                description: description,
            });
        }

        // push user
        descriptions.push({
            alias: this.user.alias,
            description: this.user.description,
        });

        // push system
        descriptions.push({
            alias: this.system.alias,
            description: this.system.description,
        });

        return descriptions;
    }

    public pushMessage(message: IMessage){
        this.conversation.push(message);
    }

    public async rolePlay(message: IMessage): Promise<IMessage>{
        this.pushMessage(message);
        var rolePlay = await this.selectNextRoleWithRandomVote();
        if (rolePlay.alias == this.user.alias){
            if (AgentProvider.hasProvider(this.user.type)){
                var agentExecutor = AgentProvider.getProvider(this.user)(this.user);
                var response = await agentExecutor.rolePlay(this.conversation, [...this.agents, this.user]);
                return response;
            }
            else{
                return this.ASK_USER_MESSAGE;
            }
        }

        if (rolePlay.alias == this.system.alias){
            return this.TERMINATE_MESSAGE;
        }

        var agentExecutor = AgentProvider.getProvider(rolePlay)(rolePlay);
        var response = await agentExecutor.rolePlay(this.conversation, [...this.agents, this.user]);
        return response;
    }

    public async rolePlayWithMaxRound(message: IMessage, max_round: number): Promise<IMessage>{
        if (max_round <= 0){
            return this.TERMINATE_MESSAGE;
        }

        var response = await this.rolePlay(message);

        if (response.from == this.user.alias || response.from == this.system.alias){
            return response;
        }

        return await this.rolePlayWithMaxRound(response, max_round - 1);
    }

    public async selectNextRoleWithRandomVote(): Promise<IAgent>{
        var agent_description = await this.getRoleDescription();
        var agent_list = [...this.agents, this.user, this.system];
        var index = Math.floor(Math.random() * this.agents.length);
        var agent = agent_list[index];
        var agentExecutor = AgentProvider.getProvider(agent)(agent);
        var voteIndex = await agentExecutor.selectNextRole(this.conversation, agent_description);
        if (voteIndex >= 0){
            return agent_list[voteIndex];
        }
        else{
            return this.user;
        }
    }

    public async selectNextRoleWithMaxVote(): Promise<IAgent>{
        var votes: Record<string, number> = {};
        var agent_description = await this.getRoleDescription();
        var agent_list = [...this.agents, this.user, this.system];
        for (var agent of this.agents){
            var agentExecutor = AgentProvider.getProvider(agent)(agent);
            var voteIndex = await agentExecutor.selectNextRole(this.conversation, agent_description);
            if (voteIndex >= 0){
                var selectedAgent = agent_list[voteIndex];
                if (selectedAgent.alias in votes){
                    votes[selectedAgent.alias] += 1;
                }
                else{
                    votes[selectedAgent.alias] = 1;
                }
            }
        }

        var maxVote = 0;
        var maxVoteIndex = 0;
        for (var i = 0; i < agent_list.length; i++){
            var agent = agent_list[i];
            if (agent.alias in votes){
                if (votes[agent.alias] > maxVote){
                    maxVote = votes[agent.alias];
                    maxVoteIndex = i;
                }
            }
        }

        return agent_list[maxVoteIndex];
    }
}