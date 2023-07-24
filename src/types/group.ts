import { IRecord } from "@/types/storage";
import { IMessage } from "@/types/chat";

export interface IGroup extends IRecord{
    name: string,
    agents: string[],
    conversation: IMessage[],
}
