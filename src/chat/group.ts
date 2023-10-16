import { AgentProvider } from "@/agent/agentProvider";
import { IAgent, IAgentRecord } from "@/agent/type";
import { IGroup, IGroupRecord } from "@/chat/type";
import { IMarkdownMessage } from "@/message/MarkdownMessage";
import { IChatMessage, IChatMessageRecord, IsUserMessage } from "@/message/type";
import { IChatModel, IChatModelRecord } from "@/model/type";
import { Logger } from "@/utils/logger";
import { content } from "html2canvas/dist/types/css/property-descriptors/content";

export class GroupChat implements IGroup {
    name: string;
    llm: IChatModel;
    agents: IAgent[];
    admin: IAgent;
    initial_conversation: IChatMessage[];
    terminate_message_prefix: string = "[GROUP_TERMINATE]";
    clear_message_prefix: string = "[GROUP_CLEAR]";
    end_of_message_token = "<eof_msg>";
    
    
    constructor(
        name: string,
        llm: IChatModel,
        agents: IAgent[],
        admin: IAgent,
    ){
        this.name = name;
        this.llm = llm;
        this.agents = [
            ...agents,
            admin,
        ]
        this.admin = admin;
        this.initial_conversation = [];
    }

    addInitialConversation(message: string, from: IAgent){
        // check if from is in agents
        if (this.agents.find((agent) => agent.name.toLowerCase() == from.name.toLowerCase()) == undefined){
            throw new Error(`Agent ${from.name} is not in the group`);
        }
        
        this.initial_conversation.push({
            role: "user",
            content: message,
            from: from.name,
        } as IChatMessage);
    }

    async callAsync(messages: IChatMessage[], max_round?: number | undefined): Promise<IChatMessage[]> {
        if (max_round === undefined){
            max_round = 10;
        }

        for (var i = 0; i < max_round; i++){
            var nextSpeaker = await this.selectNextSpeakerAsync(messages) ?? this.admin;
            var conversation = await this.processConversationsForAgentAsync(nextSpeaker, this.initial_conversation, messages);
            var nextMessage = await nextSpeaker.callAsync(conversation, undefined, [this.end_of_message_token], undefined);
            messages.push(nextMessage);
            if (this.isGroupChatTerminateMessage(nextMessage)){
                break;
            }
        }

        return messages;
    }

    async selectNextSpeakerAsync(chatHistory: IChatMessage[]): Promise<IAgent | undefined>{
        var agentNames = this.agents.map((agent) => agent.name.toLowerCase());
        var rolePlayMessage = {
            role: "system",
            content: `You are in a role play game. Carefully read the conversation history and carry on the conversation.
-Available roles-
${agentNames.join("\n")}
-End of roles-

Each message will start with 'From name:', e.g:
From admin:
//your message//.`
        } as IChatMessage;

        var conversation = await this.processConversationsForRolePlayAsync(this.initial_conversation, chatHistory);
        conversation = [
            rolePlayMessage,
            ...conversation
        ];

        var response = await this.llm.getChatCompletion(
            {
                messages: conversation,
                temperature: 0,
                maxTokens: 64,
                stop: [":"],
            }
        )

        // fromName: From xxx
        try{
            var fromName = response.content;
            var name = fromName?.substring(fromName.indexOf("From") + 5).trim();
            var agent = this.agents.find((agent) => agent.name.toLowerCase() == name?.toLowerCase());

            return agent;
        }
        catch(e){
            return undefined;
        }
    }

    async processConversationsForAgentAsync(agent: IAgent, initializeMessages: IChatMessage[], conversation: IChatMessage[]): Promise<IChatMessage[]>{
        var messagesToKeep = await this.messagesToKeepAsync(conversation);
        var conversationToKeep = [
            ...initializeMessages,
            ...messagesToKeep
        ];
        var messagesForAgent = []
        for (var i = 0; i < conversationToKeep.length; i++){
            var message = conversationToKeep[1];
            if (message.from?.toLowerCase() != agent.name.toLowerCase()){
                var messageToAdd = {
                    role: "user",
                    content: `${message.content}
${this.end_of_message_token}
From ${message.from}
round # ${i}`,
                } as IChatMessage;
                messagesForAgent.push(messageToAdd);
            }
            else{
                if(message.functionCall != undefined){
                    var functionCallMessage = {
                        role: "assistant",
                        content: undefined,
                        functionCall: message.functionCall,
                    } as IChatMessage;

                    messagesForAgent.push(functionCallMessage);

                    var functionResultMessage = {
                        role: 'function',
                        content: message.content,
                        name: message.name,
                    } as IChatMessage;

                    messagesForAgent.push(functionResultMessage);
                }
                else{
                    var messageToAdd = {
                        role: "assistant",
                        content: `${message.content}
${this.end_of_message_token}
round # ${i}`,
                    } as IChatMessage;
                    messagesForAgent.push(messageToAdd);
                }
            }
        }

        return messagesForAgent;
    }

    async processConversationsForRolePlayAsync(initialMessages: IChatMessage[], conversation: IChatMessage[]): Promise<IChatMessage[]>{
        var conversationToKeep = await this.messagesToKeepAsync(conversation);
        conversationToKeep = [
            ...initialMessages,
            ...conversationToKeep
        ];

        return conversationToKeep.map((message, i, _) => ({
            role: "user",
            content: `From ${message.from}:
${message.content}
${this.end_of_message_token}
round # ${i}`,
        } as IChatMessage));
    }

    async messagesToKeepAsync(chatHistory: IChatMessage[]): Promise<IChatMessage[]>{
        var lastClearMessageIndex = chatHistory.findLastIndex((message) => this.isGroupChatClearMessage(message));

        if (chatHistory.filter((message) => this.isGroupChatTerminateMessage(message)).length > 1){
            lastClearMessageIndex = chatHistory.slice(0, lastClearMessageIndex - 1).findLastIndex((message) => this.isGroupChatClearMessage(message));
            chatHistory = chatHistory.slice(lastClearMessageIndex + 1);
        }

        lastClearMessageIndex = chatHistory.findLastIndex((message) => this.isGroupChatClearMessage(message));

        if (lastClearMessageIndex != -1 && chatHistory.length - 1 > lastClearMessageIndex){
            chatHistory = chatHistory.slice(lastClearMessageIndex + 1);
        }

        return chatHistory;
    }

    isGroupChatTerminateMessage( message: IChatMessage): boolean{
        return message.content?.includes(this.terminate_message_prefix) ?? false;
    }

    isGroupChatClearMessage( message: IChatMessage): boolean{
        return message.content?.includes(this.clear_message_prefix) ?? false;
    }
}