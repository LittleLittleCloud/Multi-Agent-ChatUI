import { Provider } from "@/utils/app/provider";
import { IMemory } from "./type";
import { IEmbeddingModel } from "@/model/type";
import { BaseMemory } from "langchain/memory";
import { IChatMessageRecord } from "@/message/type";

export const MemoryProvider = new Provider<IMemory, (config: IMemory, embedding?: IEmbeddingModel, history?: IChatMessageRecord[]) => BaseMemory >();
