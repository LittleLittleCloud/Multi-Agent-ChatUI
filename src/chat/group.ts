import { IAgent, IAgentRecord } from "@/agent/type";
import { UserProxyAgent } from "@/agent/userProxyAgent";
import { IGroup, IGroupRecord } from "@/chat/type";
import { ILogMessageRecord, LogMessageTypeString } from "@/message/LogMessage";
import { IMarkdownMessageRecord } from "@/message/MarkdownMessage";
import { IChatMessageRecord, IMessageRecord, IsUserMessage } from "@/message/type";
import { IChatModel, IChatModelRecord } from "@/model/type";
import { Logger } from "@/utils/logger";

export class GroupChat implements IGroup {
    name: string;
    llm: IChatModel;
    agents: IAgent[];
    admin: IAgent;
    initial_conversation: IChatMessageRecord[];
    terminate_message_prefix: string = "[GROUP_TERMINATE]";
    clear_message_prefix: string = "[GROUP_CLEAR]";
    end_of_message_token = "<eof_msg>";
    messageHandler?: (message: IMessageRecord) => void;
    reselectSpeakerHandler?: (available_agents: IAgent[], prompt?: string) => Promise<IAgent | undefined>;

    constructor(
        name: string,
        llm: IChatModel,
        agents: IAgent[],
        admin: IAgent,
        messageHandler?: (message: IMessageRecord) => void,
        reselectSpeakerHandler?: (available_agents: IAgent[], prompt?: string) => Promise<IAgent | undefined>,
    ){
        this.name = name;
        this.llm = llm;
        this.agents = [
            ...agents,
            admin,
        ]
        this.admin = admin;
        this.initial_conversation = [];
        this.messageHandler = messageHandler;
        this.reselectSpeakerHandler = reselectSpeakerHandler;
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
        } as IChatMessageRecord);
    }

    async callAsync(messages: IChatMessageRecord[], max_round?: number | undefined): Promise<IChatMessageRecord[]> {
        if (max_round === undefined){
            max_round = 10;
        }
        this.Debug(`max round: ${max_round}`)
        for (var i = 0; i < max_round; i++){
            try{
                this.Debug(`round left: ${max_round - i}`)
                var nextSpeaker = await this.selectNextSpeakerAsync(messages) ?? this.admin;
                this.Debug(`next speaker: ${nextSpeaker.name}`)
                if (nextSpeaker instanceof UserProxyAgent){
                    if (this.reselectSpeakerHandler){
                        var available_agents = this.agents.filter((agent) => agent.name.toLowerCase() != nextSpeaker.name.toLowerCase());
                        nextSpeaker = await this.reselectSpeakerHandler(available_agents, 'select next agent to speak, or click on cancel if you want to type a message') ?? this.admin;
    
                        if (nextSpeaker instanceof UserProxyAgent || nextSpeaker == undefined){
                            this.Debug("cancel, exit group chat");
                            break;
                        }

                        this.Debug(`next speaker: ${nextSpeaker.name}`)
                    }
                    else{
                        break;
                    }
                }
    
                var conversation = await this.processConversationsForAgentAsync(nextSpeaker, this.initial_conversation, messages);
                this.Debug(`${nextSpeaker.name} is responding a message`)
                var nextMessage = await nextSpeaker.callAsync({
                    messages: conversation,
                    stopWords: [this.end_of_message_token],
                });
                messages.push(nextMessage);
                if (this.messageHandler){
                    this.messageHandler(nextMessage);
                }
                if (this.isGroupChatTerminateMessage(nextMessage)){
                    this.Debug("terminate message received");
                    break;
                }
            }
            catch(e){
                let message = `Error in round ${i}`;
                if (e instanceof Error){
                    message = `${message}: ${e.message}`;
                    this.Error(`Error in round ${i}`, e);
                }
                else{
                    this.Error(`Error in round ${i}`, new Error(message));
                }
            }
        }

        return messages;
    }

    async selectNextSpeakerAsync(chatHistory: IChatMessageRecord[]): Promise<IAgent | undefined>{
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
        } as IChatMessageRecord;

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
            this.Verbose(`role-play response: ${fromName}`)
            var name = fromName?.substring(fromName.indexOf("From") + 5).trim();
            var agent = this.agents.find((agent) => agent.name.toLowerCase() == name?.toLowerCase());

            return agent;
        }
        catch(e){
            return undefined;
        }
    }

    Error(message: string, error: Error){
        Logger.error(`[GroupChat] Error: ${message} ${error}`);
        if (this.messageHandler){
            this.messageHandler({
                type: LogMessageTypeString,
                level: 'error',
                details: error.message + "\n" + error.stack,
                content: message,
            } as ILogMessageRecord);
        }
    }

    Debug(message: string, details?: string){
        Logger.debug(`[GroupChat] ${message}`);
        if (this.messageHandler){
            this.messageHandler({
                type: LogMessageTypeString,
                level: 'debug',
                details: details,
                content: message,
            } as ILogMessageRecord);
        }
    }

    Verbose(message: string, details?: string){
        Logger.debug(`[GroupChat] ${message}`);
        if (this.messageHandler){
            this.messageHandler({
                type: LogMessageTypeString,
                level: 'verbose',
                details: details,
                content: message,
            } as ILogMessageRecord);
        }
    }

    async processConversationsForAgentAsync(agent: IAgent, initializeMessages: IChatMessageRecord[], conversation: IChatMessageRecord[]): Promise<IChatMessageRecord[]>{
        var messagesToKeep = await this.messagesToKeepAsync(conversation);
        var conversationToKeep = [
            ...initializeMessages,
            ...messagesToKeep
        ];
        var messagesForAgent = []
        for (var i = 0; i < conversationToKeep.length; i++){
            var message = conversationToKeep[i];
            if (message.from?.toLowerCase() != agent.name.toLowerCase()){
                var messageToAdd = {
                    role: "user",
                    content: `${message.content}
${this.end_of_message_token}
From ${message.from}
round # ${i}`,
                } as IChatMessageRecord;
                messagesForAgent.push(messageToAdd);
            }
            else{
                if(message.functionCall != undefined){
                    var functionCallMessage = {
                        role: "assistant",
                        content: undefined,
                        functionCall: message.functionCall,
                    } as IChatMessageRecord;

                    messagesForAgent.push(functionCallMessage);

                    var functionResultMessage = {
                        role: 'function',
                        content: message.content,
                        name: message.name,
                    } as IChatMessageRecord;

                    messagesForAgent.push(functionResultMessage);
                }
                else{
                    var messageToAdd = {
                        role: "assistant",
                        content: `${message.content}
${this.end_of_message_token}
round # ${i}`,
                    } as IChatMessageRecord;
                    messagesForAgent.push(messageToAdd);
                }
            }
        }

        return messagesForAgent;
    }

    async processConversationsForRolePlayAsync(initialMessages: IChatMessageRecord[], conversation: IChatMessageRecord[]): Promise<IChatMessageRecord[]>{
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
        } as IChatMessageRecord));
    }

    async messagesToKeepAsync(chatHistory: IChatMessageRecord[]): Promise<IChatMessageRecord[]>{
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

    isGroupChatTerminateMessage( message: IChatMessageRecord): boolean{
        return message.content?.includes(this.terminate_message_prefix) ?? false;
    }

    isGroupChatClearMessage( message: IChatMessageRecord): boolean{
        return message.content?.includes(this.clear_message_prefix) ?? false;
    }
}