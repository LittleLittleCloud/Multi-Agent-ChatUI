import { IAzureGPTRecord, AzureGPT, AzureTextEmbeddingsAda002V2, IAzureTextEmbeddingAda002V2 } from "./GPT";
import { AzureEmbeddingConfig, GPTConfig } from "./ConfigPanel";
import { EmbeddingProvider, LLMProvider } from "@/model/llmprovider";

// register LLM provider
LLMProvider.registerProvider<IAzureGPTRecord>(
    "azure.gpt",
    (model) => {
        const azureGPTRecord = new AzureGPT({
            ...model,
            isChatModel: true,
            isStreaming: true,
            type: "azure.gpt",
        });

        return new AzureGPT(azureGPTRecord);
    },
    (model, onConfigChange) => GPTConfig(model, (model) => onConfigChange!(model)),
    new AzureGPT({
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
    }));

// // register embedding provider
// EmbeddingProvider.registerProvider<IAzureTextEmbeddingAda002V2>(
//     "azure.text-embedding-ada-002-v2",
//     (model) => new AzureTextEmbeddingsAda002V2(model as IAzureTextEmbeddingAda002V2),
//     (model, onConfigChange) => AzureEmbeddingConfig(model, (model) => onConfigChange(model)),
//     {
//         type: "azure.text-embedding-ada-002-v2",
//         apiVersion: "2021-03-01-preview",
//     } as IAzureTextEmbeddingAda002V2);
