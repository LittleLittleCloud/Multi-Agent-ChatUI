import { IRecord } from "@/types/storage";
import { IChatMessage } from "@/message/type";

export interface IAgentRecord extends IRecord{
    name: string,
    system_message: string,
    avatar: string,
}

export interface IAgent{
    name: string;
    
    callAsync(
        messages: IChatMessage[],
        temperature?: number,
        stop_words?: string[],
        max_tokens?: number): Promise<IChatMessage>;
}
