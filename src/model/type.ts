import { IChatMessageRecord, IFunctionCall } from "@/message/type";
import { IRecord } from "@/types/storage";
import { FunctionDefinition } from "@azure/openai";

export interface IModel extends IRecord{
    type: string;
    description?: string;
}

export interface IEmbeddingModel extends IModel{
}

export interface IChatModelRecord extends IModel{
    isStreaming: boolean;
}

export interface ChatCompletionParams{
    messages: IChatMessageRecord[],
    temperature?: number,
    maxTokens?: number,
    topP?: number,
    presencePenalty?: number,
    frequencyPenalty?: number,
    stop?: string[] | undefined,
    functions?: FunctionDefinition[] | undefined,
}

export interface IChatModel{
    getChatCompletion(messages: ChatCompletionParams): Promise<IChatMessageRecord>;
}