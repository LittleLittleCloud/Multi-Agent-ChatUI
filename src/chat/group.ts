import { AgentProvider } from "@/agent/agentProvider";
import { IAgent } from "@/agent/type";
import { IGroup } from "@/chat/type";
import { IMarkdownMessage } from "@/message/MarkdownMessage";
import { IMessage, IsUserMessage } from "@/message/type";
import { Logger } from "@/utils/logger";

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
    
    constructor(
        user: IAgent,
        agents: IAgent[],
        conversation: IMessage[],
        max_round: number = 10,){
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

        return descriptions;
    }

    public async selectNextSpeaker(): Promise<IAgent>{
        var agents = [...this.agents, this.user];
        var first_agent = agents[0];
        var agentProvider = AgentProvider.getProvider(first_agent)(first_agent);
        var selectedAgentIndex = await agentProvider.selectNextRole(this.conversation, agents);
        if (selectedAgentIndex >= 0){
            return agents[selectedAgentIndex];
        }
        else{
            Logger.debug(`no agent selected, return user`);
            return this.user;
        }
    }

    public pushMessage(message: IMessage){
        this.conversation.push(message);
    }

    public async rolePlay(message: IMessage): Promise<IMessage>{
        this.pushMessage(message);
        var rolePlay = await this.selectNextSpeaker();
        if (rolePlay.alias == this.user.alias){
            return this.ASK_USER_MESSAGE;
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
}