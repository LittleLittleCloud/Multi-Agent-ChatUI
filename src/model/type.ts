import { IChatMessage } from "@/message/type";
import { IRecord } from "@/types/storage";

export interface IModel extends IRecord{
    type: string;
    description?: string;
}

export interface IEmbeddingModel extends IModel{
}

export interface IChatModelRecord extends IModel{
    isStreaming: boolean;
}

export interface IChatModel{
    getChatCompletion(messages: IChatMessage[], temperature?: number, maxTokens?: number, topP?: number, presencePenalty?: number, frequencyPenalty?: number, stop?: string[]): Promise<IChatMessage>;
}