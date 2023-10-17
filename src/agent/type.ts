import { IRecord } from "@/types/storage";
import { IChatMessageRecord } from "@/message/type";

export interface IAgentRecord extends IRecord{
    name: string,
    system_message: string,
    avatar: string,
}
export interface AgentCallParams{
    messages: IChatMessageRecord[],
    maxTokens?: number,
    temperature?: number,
    stopWords?: string[],
}
export interface IAgent{
    name: string;

    callAsync(params: AgentCallParams): Promise<IChatMessageRecord>;
}
