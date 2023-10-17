import { Provider } from "@/utils/app/provider";
import { IEmbeddingModel, IChatModelRecord, IChatModel } from "@/model/type";
import { Embeddings } from "langchain/embeddings/base";

export const LLMProvider = new Provider<IChatModelRecord, (config: IChatModelRecord) => IChatModel>();

export const EmbeddingProvider = new Provider<IEmbeddingModel, (config: IEmbeddingModel) => Embeddings>();