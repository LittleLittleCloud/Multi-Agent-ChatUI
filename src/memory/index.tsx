import { IEmbeddingModel } from "@/model/type";
import { ChatMemory, IChatMemory } from "./chatMemory";
import { ChatMemoryConfigPanel } from "./chatMemoryConfigPanel";
import { MemoryProvider } from "./memoryProvider";
import { IMemory } from "./type";
import { IChatMessageRecord } from "@/message/type";

MemoryProvider.registerProvider(
    "memory.baseMemory",
    (config: IMemory, embedding?: IEmbeddingModel, history?: IChatMessageRecord[]) => new ChatMemory({history:history, ...config as IChatMemory}),
    (config: IMemory, onConfigChange: (config: IMemory) => void) => {
        var chatMemory = config as IChatMemory;
        return <ChatMemoryConfigPanel chatMemoryConfig={chatMemory} onChange={onConfigChange} />;
    },
    {
        type: "memory.baseMemory",
        maxHistoryLength: 64,
        memoryKey: "history",
    } as IChatMemory,
);