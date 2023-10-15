import { IAgent, IAgentRecord } from "@/agent/type";
import { IChatMessage, IChatMessageRecord } from "@/message/type";
import { IChatModelRecord } from "@/model/type";
import { IRecord } from "@/types/storage";

export interface IGroupRecord extends IRecord{
    name: string;
    agents: string[];
    initial_conversation: IChatMessageRecord[];
}

export interface IGroup{
    name: string;

    callAsync(
        messages: IChatMessage[],
        max_round?: number) : Promise<IChatMessage[]>;
}
