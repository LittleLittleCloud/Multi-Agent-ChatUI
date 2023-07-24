import { BaseLLM, BaseLLMParams, LLM } from "langchain/llms/base";
import { IJsonConverter, extract } from "@/utils/app/convertJson";
import { injectable } from "inversify";
import { IRecord } from "@/types/storage";
import { RecordMap } from "@/utils/app/recordProvider";
import { CallbackManagerForLLMRun } from "langchain/callbacks";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { type } from "os";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain";
import { IEmbeddingModel, ILLMModel } from "@/model/type";

// azure openai gpt parameters
interface IGPTBaseModelConfiguration extends ILLMModel {
    resourceName?: string,
    deploymentID?: string,
    apiKey?: string,
    temperature?: number,
    apiVersion?: string,
    maxTokens?: number,
    topP?: number,
    stop?: string[],
    presencePenalty?: number,
    frequencyPenalty?: number,
}

interface IGPT35Turbo extends IGPTBaseModelConfiguration{
    type: 'azure.gpt-35-turbo',
    isStreaming: true,
    isChatModel: true,
}

class GPT_35_TURBO extends ChatOpenAI implements IGPT35Turbo {
    isStreaming!: true;
    isChatModel!: true;
    description = "The ChatGPT model (gpt-35-turbo) is a language model designed for conversational interfaces and the model behaves differently than previous GPT-3 models. Previous models were text-in and text-out, meaning they accepted a prompt string and returned a completion to append to the prompt. However, the ChatGPT model is conversation-in and message-out. The model expects a prompt string formatted in a specific chat-like transcript format, and returns a completion that represents a model-written message in the chat."
    type!: "azure.gpt-35-turbo";

    constructor(fields: Partial<IGPT35Turbo>){
        super({
            temperature: fields.temperature,
            azureOpenAIApiKey: fields.apiKey,
            azureOpenAIApiInstanceName: fields.resourceName,
            azureOpenAIApiDeploymentName: fields.deploymentID,
            topP: fields.topP,
            maxTokens: fields.maxTokens,
            stop: fields.stop,
            azureOpenAIApiVersion: fields.apiVersion ?? '2023-03-15-preview',
            presencePenalty: fields.presencePenalty,
            frequencyPenalty: fields.frequencyPenalty,
        });
        this.description = fields.description ?? this.description;
    }

    _llmType(): string {
        return this.type;
    }
}

interface ITextDavinci003 extends IGPTBaseModelConfiguration{
    type: 'azure.text-davinci-003';
    isStreaming: true;
    isChatModel: false;
}

class TextDavinci003 extends OpenAI {
    isStreaming = true;
    isChatModel = false;
    description = `Davinci is the most capable model and can perform any task the other models can perform, often with less instruction. For applications requiring deep understanding of the content, like summarization for a specific audience and creative content generation, Davinci produces the best results. The increased capabilities provided by Davinci require more compute resources, so Davinci costs more and isn't as fast as other models.
    Another area where Davinci excels is in understanding the intent of text. Davinci is excellent at solving many kinds of logic problems and explaining the motives of characters. Davinci has been able to solve some of the most challenging AI problems involving cause and effect.`
    type = "azure.text-davinci-003";

    constructor(fields: Partial<ITextDavinci003>){
        super({
            temperature: fields.temperature,
            azureOpenAIApiKey: fields.apiKey,
            azureOpenAIApiInstanceName: fields.resourceName,
            azureOpenAIApiDeploymentName: fields.deploymentID,
            topP: fields.topP,
            maxTokens: fields.maxTokens,
            stop: fields.stop,
            azureOpenAIApiVersion: fields.apiVersion ?? '2023-03-15-preview',
            presencePenalty: fields.presencePenalty,
            frequencyPenalty: fields.frequencyPenalty,
        });

        this.description = fields.description ?? this.description;
    }

    _llmType(): string {
        return this.type;
    }
}

// embedding models
interface IAzureEmbeddingModel extends IEmbeddingModel{
    apiKey?: string;
    resourceName?: string;
    deploymentName?: string;
    apiVersion?: string;
}

interface IAzureTextEmbeddingAda002V2 extends IAzureEmbeddingModel{
    type: "azure.text-embedding-ada-002-v2";
}

class AzureTextEmbeddingsAda002V2 extends OpenAIEmbeddings{
    type = "azure.text-embedding-ada-002-v2";

    constructor(fields: Partial<IAzureTextEmbeddingAda002V2>){
        super({
            azureOpenAIApiKey: fields.apiKey,
            azureOpenAIApiDeploymentName: fields.deploymentName,
            azureOpenAIApiVersion: fields.apiVersion,
            azureOpenAIApiInstanceName: fields.resourceName,
        });
    }
}

export { GPT_35_TURBO, TextDavinci003, AzureTextEmbeddingsAda002V2 };
export type { IGPT35Turbo, ITextDavinci003, IAzureTextEmbeddingAda002V2 };