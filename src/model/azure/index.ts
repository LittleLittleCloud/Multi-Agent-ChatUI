import { IGPT, GPT, AzureTextEmbeddingsAda002V2, IAzureTextEmbeddingAda002V2 } from "./GPT";
import { AzureEmbeddingConfig, GPTConfig } from "./ConfigPanel";
import { EmbeddingProvider, LLMProvider } from "@/model/llmprovider";

// register LLM provider
LLMProvider.registerProvider<IGPT>(
    "azure.gpt",
    (model) => new GPT(model as IGPT),
    (model, onConfigChange) => GPTConfig(model, (model) => onConfigChange(model as IGPT)),
    {
        type: "azure.gpt",
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isChatModel: true,
        isStreaming: true,
    } as IGPT);

// register embedding provider
EmbeddingProvider.registerProvider<IAzureTextEmbeddingAda002V2>(
    "azure.text-embedding-ada-002-v2",
    (model) => new AzureTextEmbeddingsAda002V2(model as IAzureTextEmbeddingAda002V2),
    (model, onConfigChange) => AzureEmbeddingConfig(model, (model) => onConfigChange(model)),
    {
        type: "azure.text-embedding-ada-002-v2",
        apiVersion: "2021-03-01-preview",
    } as IAzureTextEmbeddingAda002V2);
