import { OpenAIGPT, IOpenAIGPTRecord, ITextDavinci003 } from "./GPT";
import { ModelConfig } from "./ModelConfig";
import { LLMProvider } from "../llmprovider";

LLMProvider.registerProvider<IOpenAIGPTRecord>(
    "openai.gpt",
    (model) => {
        var rc = new OpenAIGPT(
            { ...model, isChatModel: true, isStreaming: true, type: "openai.gpt" }
        );

        return new OpenAIGPT(rc);
    },
    (model, onConfigChange) => ModelConfig(model, (model) => onConfigChange(model)),
    new OpenAIGPT({
        type: "openai.gpt",
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isChatModel: true,
        isStreaming: true,
        model: "gpt-3.5-turbo",
    }));
