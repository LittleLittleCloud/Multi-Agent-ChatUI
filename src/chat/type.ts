import { IChatMessageRecord } from "@/message/type";
import { IRecord } from "@/types/storage";

export interface IGroupRecord extends IRecord{
    name: string;
    agents: string[];
    initial_conversation: IChatMessageRecord[];
}

export interface IGroup{
    name: string;

    callAsync(
        messages: IChatMessageRecord[],
        max_round?: number) : Promise<IChatMessageRecord[]>;
}
