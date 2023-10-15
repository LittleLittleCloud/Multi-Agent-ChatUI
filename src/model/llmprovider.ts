import { Provider } from "@/utils/app/provider";
import { BaseLLM } from "langchain/llms/base";
import { IEmbeddingModel, IChatModelRecord, IChatModel } from "@/model/type";
import { Embeddings } from "langchain/embeddings/base";
import { BaseLanguageModel } from "langchain/base_language";
import { BaseChatModel } from "langchain/chat_models/base";

export const LLMProvider = new Provider<IChatModelRecord, (config: IChatModelRecord) => IChatModel>();

export const EmbeddingProvider = new Provider<IEmbeddingModel, (config: IEmbeddingModel) => Embeddings>();