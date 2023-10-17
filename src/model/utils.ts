import { IChatMessageRecord } from "@/message/type";
import { ChatCompletionMessageParam } from "openai/resources";

export function getGPTMaxTokenLimit(modelType: string): number{
    switch (modelType) {
        case 'gpt-4':
        case 'gpt-4-0613':
        case 'gpt-4-0314':
            return 8192;
        case 'gpt-4-32k':
        case 'gpt-4-32k-0613':
        case 'gpt-4-32k-0314':
            return 32768;
        case 'gpt-3.5-turbo':
        case 'gpt-3.5-turbo-0613':
        case 'gpt-3.5-turbo-0314':
            return 4096;
        case 'gpt-3.5-turbo-16k':
        case 'gpt-3.5-turbo-16k-0613':
            return 16384;
        default:
            return 4096;
    };
}

export const AVAILABLE_GPT_MODELS = [
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-16k",
    "gpt-3.5-turbo-0613",
    "gpt-3.5-turbo-16k-0613",
    "gpt-3.5-turbo-0301",
    "gpt-4",
    "gpt-4-0613",
    "gpt-4-32k",
    "gpt-4-32k-0613",
    "gpt-4-0314",
    "gpt-4-32k-0314",
];

export function convertToOpenAIChatMessages(messages: IChatMessageRecord[]): ChatCompletionMessageParam[] {
    var msgs = messages.map((message) => {
        if (message.functionCall != null){
            return {
                role: 'assistant',
                function_call: message.functionCall,
                content: null,
            } as ChatCompletionMessageParam
        }
        else if (message.role == 'function'){
            return {
                role: 'function',
                name: message.name,
                content: message.content,
            } as ChatCompletionMessageParam
        }
        else{
            return {
                role: message.role,
                content: message.content,
            } as ChatCompletionMessageParam
        }
    });

    return msgs;
}