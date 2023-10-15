import { IChatModel, IChatModelRecord } from "../type";
import { IChatMessage } from "@/message/type";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { convertToOpenAIChatMessages } from "../utils";

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

// export class TextDavinci003 extends OpenAI{
//     type: string;
//     constructor(fields: ITextDavinci003){
//         super({
//             temperature: fields.temperature ?? 0.7,
//             topP: fields.topP ?? 1,
//             presencePenalty: fields.presencePenalty ?? 0,
//             frequencyPenalty: fields.frequencyPenalty ?? 0,
//             stop: fields.stop,
//             streaming: fields.isStreaming ?? false,
//             openAIApiKey: fields.apiKey,
//             modelName: fields.model,
//         })

//         this.type = fields.type ?? "openai.text-davinci-003";
//     }

//     _llmType(): string {
//         return this.type;
//     }
// }

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

    async getChatCompletion(messages: IChatMessage[], temperature?: number | undefined, maxTokens?: number | undefined, topP?: number | undefined, presencePenalty?: number | undefined, frequencyPenalty?: number | undefined, stop?: string[] | undefined): Promise<IChatMessage> {
        var openai = new OpenAI({
            apiKey: this.apiKey,
            timeout: 120000,
        })

        var msgs = convertToOpenAIChatMessages(messages);

        const chatCompletion = await openai.chat.completions.create(
            {
                model: this.model,
                messages: msgs,
                temperature: temperature ?? this.temperature,
                max_tokens: maxTokens ?? this.maxTokens,
                top_p: topP ?? this.topP,
                presence_penalty: presencePenalty ?? this.presencePenalty,
                frequency_penalty: frequencyPenalty ?? this.frequencyPenalty,
                stop: stop ?? this.stop,
            }
        );

        var choices = chatCompletion.choices;
        var completion = choices[0].message;

        return {
            role: completion.role,
            content: completion.content,
        } as IChatMessage;
    }
}