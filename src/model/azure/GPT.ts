import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { IEmbeddingModel, IChatModelRecord, IChatModel } from "@/model/type";
import { IChatMessage } from "@/message/type";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { convertToOpenAIChatMessages } from "../utils";

// azure openai gpt parameters
export interface IGPTBaseModelConfiguration extends IChatModelRecord {
    endpoint?: string,
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

export interface IAzureGPTRecord extends IGPTBaseModelConfiguration{
    type: 'azure.gpt',
    isStreaming: true,
    isChatModel: true,
}


export class AzureGPT implements IChatModel, IAzureGPTRecord {
    type: 'azure.gpt';
    isStreaming: true;
    isChatModel: true;
    endpoint: string;
    deploymentID?: string;
    apiKey: string;
    temperature?: number;
    apiVersion?: string;
    maxTokens?: number;
    topP?: number;
    stop?: string[];
    presencePenalty?: number;
    frequencyPenalty?: number;

    constructor(fields: Partial<IAzureGPTRecord>){
        this.endpoint = fields.endpoint!;
        this.deploymentID = fields.deploymentID;
        this.apiKey = fields.apiKey!;
        this.temperature = fields.temperature;
        this.apiVersion = fields.apiVersion;
        this.maxTokens = fields.maxTokens;
        this.topP = fields.topP;
        this.stop = fields.stop;
        this.presencePenalty = fields.presencePenalty;
        this.frequencyPenalty = fields.frequencyPenalty;
        this.type = 'azure.gpt';
        this.isStreaming = true;
        this.isChatModel = true;
    }

    async getChatCompletion(messages: IChatMessage[], temperature?: number | undefined, maxTokens?: number | undefined, topP?: number | undefined, presencePenalty?: number | undefined, frequencyPenalty?: number | undefined, stop?: string[] | undefined): Promise<IChatMessage> {
        var client = new OpenAIClient(this.endpoint, new AzureKeyCredential(this.apiKey));

        var msg = convertToOpenAIChatMessages(messages);

        var choices = await client.getChatCompletions(
            this.deploymentID!,
            msg,
            {
                temperature: temperature ?? this.temperature ?? 0.7,
                maxTokens: maxTokens ?? this.maxTokens ?? 64,
                topP: topP ?? this.topP ?? 1,
                presencePenalty: presencePenalty ?? this.presencePenalty ?? 0,
                frequencyPenalty: frequencyPenalty ?? this.frequencyPenalty ?? 0,
                stop: stop ?? this.stop ?? [],
            }
        );
        
        var replyMessage = choices.choices[0].message;
        if (replyMessage == null){
            throw new Error("Reply message is null");
        }

        return {
            content: replyMessage.content,
            role: replyMessage.role,
        } as IChatMessage;
    }
}

// embedding models
export interface IAzureEmbeddingModel extends IEmbeddingModel{
    apiKey?: string;
    resourceName?: string;
    deploymentName?: string;
    apiVersion?: string;
}

export interface IAzureTextEmbeddingAda002V2 extends IAzureEmbeddingModel{
    type: "azure.text-embedding-ada-002-v2";
}

export class AzureTextEmbeddingsAda002V2 extends OpenAIEmbeddings{
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
