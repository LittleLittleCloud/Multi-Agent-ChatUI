import { Provider } from "@/utils/app/provider";
import { BaseLLM } from "langchain/llms/base";
import { IEmbeddingModel, ILLMModel } from "@/model/type";
import { Embeddings } from "langchain/embeddings/base";
import { BaseLanguageModel } from "langchain/base_language";
import { BaseChatModel } from "langchain/chat_models/base";

export const LLMProvider = new Provider<ILLMModel, (config: ILLMModel) => BaseChatModel | BaseLLM>();

export const EmbeddingProvider = new Provider<IEmbeddingModel, (config: IEmbeddingModel) => Embeddings>();