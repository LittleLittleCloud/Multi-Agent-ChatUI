import { GPT_35_TURBO, IGPT35Turbo, ITextDavinci003, TextDavinci003 } from "./GPT";
import { ModelConfig } from "./ModelConfig";
import { LLMProvider } from "../llmprovider";

LLMProvider.registerProvider<ITextDavinci003>(
    "openai.text-davinci-003",
    (model) => new TextDavinci003(model as ITextDavinci003),
    (model, onConfigChange) => ModelConfig(model, (model) => onConfigChange(model as ITextDavinci003)),
    {
        type: "openai.text-davinci-003",
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isChatModel: false,
        isStreaming: true,
        model: "text-davinci-003",
    } as ITextDavinci003);

LLMProvider.registerProvider<IGPT35Turbo>(
    "openai.gpt-35-turbo",
    (model) => new GPT_35_TURBO(model as IGPT35Turbo ),
    (model, onConfigChange) => ModelConfig(model, (model) => onConfigChange(model as IGPT35Turbo)),
    {
        type: "openai.gpt-35-turbo",
        maxTokens: 64,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        isChatModel: true,
        isStreaming: true,
        model: "gpt-3.5-turbo",
    } as IGPT35Turbo);
