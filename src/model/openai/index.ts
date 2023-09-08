import { GPT, IGPT, ITextDavinci003, TextDavinci003 } from "./GPT";
import { ModelConfig } from "./ModelConfig";
import { LLMProvider } from "../llmprovider";

LLMProvider.registerProvider<IGPT>(
    "openai.gpt",
    (model) => new GPT(model as IGPT ),
    (model, onConfigChange) => ModelConfig(model, (model) => onConfigChange(model as IGPT)),
    {
        type: "openai.gpt",
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isChatModel: true,
        isStreaming: true,
        model: "gpt-3.5-turbo",
    } as IGPT);
