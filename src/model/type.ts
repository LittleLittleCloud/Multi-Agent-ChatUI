import { IRecord } from "@/types/storage";

export interface IModel extends IRecord{
    type: string;
    description?: string;
}

export interface IEmbeddingModel extends IModel{
}

export interface ILLMModel extends IModel{
    isStreaming: boolean;
    isChatModel: boolean;
}