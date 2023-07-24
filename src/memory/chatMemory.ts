import { InputValues } from "langchain/dist/schema";
import { BaseMemory } from "langchain/memory";
import { IMemory } from "./type";
import { IMessage } from "@/message/type";
export type OutputValues = Record<string, any>;
export type MemoryVariables = Record<string, any>;

export interface IChatMemory extends IMemory{
    type: "memory.baseMemory";
    maxHistoryLength?: number;
}

export class ChatMemory extends BaseMemory{
    get memoryKeys(): string[] {
        return [this.memoryKey];
    }
    memoryKey = "history";
    outputKey = "output";
    useChatML = false;
    chatHistory: Omit<IMessage, 'type'>[] = [];
    maxHistoryLength = 16;

    constructor({memoryKey, maxHistoryLength, history}: IChatMemory & { history?: IMessage[] }){
        super();
        if(memoryKey){
            this.memoryKey = memoryKey;
        }
        if(history){
            this.chatHistory = history;
        }
        if(maxHistoryLength){
            this.maxHistoryLength = maxHistoryLength;
        }
    }

    async removeChatMessage(message: IMessage): Promise<void> {
        var index = this.chatHistory.findIndex((m) => m.content === message.content);
        if(index >= 0){
            this.chatHistory.splice(index, 1);
        }
    }

    async saveContext(inputValues: InputValues, outputValues: OutputValues): Promise<void> {
        var content: IMessage = inputValues['message'];
        if (content.from == 'system'){
            return;
        }
        this.chatHistory.push(content);
        var output = outputValues["response"];
        if(output){
            this.chatHistory.push({from: this.outputKey, content: output});
        }
    }

    async loadMemoryVariables(_values: InputValues): Promise<MemoryVariables> {
        // return last maxHistoryLength messages
        var history = this.chatHistory.slice(-this.maxHistoryLength);
        return {
            [this.memoryKey]: history
        }
    }
}