import { IGPT35Turbo, ITextDavinci003, TextDavinci003, GPT_35_TURBO, AzureTextEmbeddingsAda002V2, IAzureTextEmbeddingAda002V2 } from "./GPT";
import { AzureEmbeddingConfig, GPTConfig } from "./ConfigPanel";
import { EmbeddingProvider, LLMProvider } from "@/model/llmprovider";

// register LLM provider
LLMProvider.registerProvider<ITextDavinci003>(
    "azure.text-davinci-003",
    (model) => new TextDavinci003(model as ITextDavinci003),
    (model, onConfigChange) => GPTConfig(model, (model) => onConfigChange(model as ITextDavinci003)),
    {
        type: "azure.text-davinci-003",
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isChatModel: false,
        isStreaming: true,
    } as ITextDavinci003);

LLMProvider.registerProvider<IGPT35Turbo>(
    "azure.gpt-35-turbo",
    (model) => new GPT_35_TURBO(model as IGPT35Turbo),
    (model, onConfigChange) => GPTConfig(model, (model) => onConfigChange(model as IGPT35Turbo)),
    {
        type: "azure.gpt-35-turbo",
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isChatModel: true,
        isStreaming: true,
    } as IGPT35Turbo);

// register embedding provider
EmbeddingProvider.registerProvider<IAzureTextEmbeddingAda002V2>(
    "azure.text-embedding-ada-002-v2",
    (model) => new AzureTextEmbeddingsAda002V2(model as IAzureTextEmbeddingAda002V2),
    (model, onConfigChange) => AzureEmbeddingConfig(model, (model) => onConfigChange(model)),
    {
        type: "azure.text-embedding-ada-002-v2",
        apiVersion: "2021-03-01-preview",
    } as IAzureTextEmbeddingAda002V2);
