import { AgentProvider } from "@/agent/agentProvider";
import { IAgent, IAgentRecord } from "@/agent/type";
import { IGroup, IGroupRecord } from "@/chat/type";
import { IMarkdownMessage } from "@/message/MarkdownMessage";
import { IChatMessage, IChatMessageRecord, IsUserMessage } from "@/message/type";
import { IChatModel, IChatModelRecord } from "@/model/type";
import { Logger } from "@/utils/logger";

export class MultiAgentGroup implements IGroup {
    name: string;
    llm: IChatModel;
    agents: IAgent[];
    admin: IAgent;
    initial_conversation: IChatMessage[];
    terminate_message_prefix: string = "[GROUP_TERMINATE]";
    
    constructor(
        name: string,
        llm: IChatModel,
        agents: IAgent[],
        admin: IAgent,
    ){
        this.name = name;
        this.llm = llm;
        this.agents = agents;
        this.admin = admin;
        this.initial_conversation = [];
    }

    callAsync(messages: IChatMessage[], max_round?: number | undefined): Promise<IChatMessage[]> {
        throw new Error("Method not implemented.");
    }
}