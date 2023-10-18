import { ChatCompletionParams, IChatModel, IChatModelRecord } from "../type";
import { IChatMessageRecord } from "@/message/type";
import { ChatCompletionMessageParam } from "openai/resources";
import { convertToOpenAIChatMessages } from "../utils";
import { OpenAIClient, OpenAIKeyCredential } from "@azure/openai";
import { IMarkdownMessageRecord } from "@/message/MarkdownMessage";

export interface IOpenAIModel extends IChatModelRecord
{
    maxTokens: number;
    temperature: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
    stop: string[];
    apiKey?: string;
    model: string;
}

export interface ITextDavinci003 extends IOpenAIModel{
    type: "openai.text-davinci-003";
    model: "text-davinci-003";
    isStreaming: true;
    isChatModel: false;
}

export interface IOpenAIGPTRecord extends IOpenAIModel{
    type: "openai.gpt";
    model: string | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-3.5-turbo-0613" | "gpt-3.5-turbo-16k-0613" | "gpt-3.5-turbo-0301" | "gpt-4" | "gpt-4-0613" | "gpt-4-32k" | "gpt-4-32k-0613" | "gpt-4-0314" | "gpt-4-32k-0314";
    isStreaming: true;
    isChatModel: true;
}

export class OpenAIGPT implements IChatModel, IOpenAIGPTRecord{
    type: "openai.gpt";
    isStreaming: true;
    isChatModel: true;
    description?: string | undefined;
    apiKey?: string | undefined;
    model: string | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-3.5-turbo-0613" | "gpt-3.5-turbo-16k-0613" | "gpt-3.5-turbo-0301" | "gpt-4" | "gpt-4-0613" | "gpt-4-32k" | "gpt-4-32k-0613" | "gpt-4-0314" | "gpt-4-32k-0314";
    maxTokens: number;
    temperature: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
    stop: string[];

    constructor(fields: Partial<IOpenAIGPTRecord>){
        this.type = "openai.gpt";
        this.isStreaming = true;
        this.isChatModel = true;
        this.description = fields.description ?? "The ChatGPT model (gpt-35-turbo) is a language model designed for conversational interfaces and the model behaves differently than previous GPT-3 models. Previous models were text-in and text-out, meaning they accepted a prompt string and returned a completion to append to the prompt. However, the ChatGPT model is conversation-in and message-out. The model expects a prompt string formatted in a specific chat-like transcript format, and returns a completion that represents a model-written message in the chat.";
        this.apiKey = fields.apiKey;
        this.model = fields.model ?? "gpt-3.5-turbo";
        this.maxTokens = fields.maxTokens ?? 64;
        this.temperature = fields.temperature ?? 0.7;
        this.topP = fields.topP ?? 1;
        this.presencePenalty = fields.presencePenalty ?? 0;
        this.frequencyPenalty = fields.frequencyPenalty ?? 0;
        this.stop = fields.stop ?? [];
    }

    async getChatCompletion(params: ChatCompletionParams): Promise<IChatMessageRecord> {
        var client = new OpenAIClient(new OpenAIKeyCredential(this.apiKey!));

        var msg = convertToOpenAIChatMessages(params.messages);

        var choices = await client.getChatCompletions(
            this.model!,
            msg,
            {
                temperature: params.temperature ?? this.temperature ?? 0.7,
                maxTokens: params.maxTokens ?? this.maxTokens ?? 64,
                topP: params.topP ?? this.topP ?? 1,
                presencePenalty: params.presencePenalty ?? this.presencePenalty ?? 0,
                frequencyPenalty: params.frequencyPenalty ?? this.frequencyPenalty ?? 0,
                stop: params.stop ?? this.stop ?? [],
                functions: params.functions,
            }
        );
        
        var replyMessage = choices.choices[0].message;
        if (replyMessage == null){
            throw new Error("Reply message is null");
        }

        return {
            ...replyMessage,
            type: 'message.markdown',
        } as IMarkdownMessageRecord;
    }
}