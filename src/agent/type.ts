import { Callbacks } from "langchain/callbacks";
import { IRecord } from "@/types/storage";
import { IMessage } from "@/message/type";

export interface IAgent extends IRecord{
    alias: string,
    description: string,
    avatar: string,
}

// MAP: multi-agent protocol
export interface IAgentExecutor{
    rolePlay(messages: IMessage[], agents: IAgent[]): Promise<IMessage>;

    describleRole(chatHistory: IMessage[]): Promise<string>;

    selectNextRole(messages: IMessage[], agents: {alias: string, description: string}[]): Promise<number>;
}
