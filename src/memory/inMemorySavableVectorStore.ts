import { IEmbeddingModel } from "@/types/model";
import { MemoryVectorStore, MemoryVectorStoreArgs } from "langchain/vectorstores/memory"
import { getEmbeddingProvider } from "@/utils/app/embeddingProvider";
import { vectorStorage } from "@/utils/blobStorage";

export class InMemorySavableVectorStore extends MemoryVectorStore{
    blobName: string;
    constructor(embeddings: IEmbeddingModel,
        args: MemoryVectorStoreArgs){
            var embeddingModelProvider = getEmbeddingProvider(embeddings);
            super(embeddingModelProvider(embeddings), args);
            this.blobName = embeddings.type;
    }

    async save_v0(): Promise<string>{
        // save memoryStore to blob
        const vector = await vectorStorage;
        await vector.saveBlob(this.memoryVectors, this.blobName);

}