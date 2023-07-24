import { IMessage } from "@/message/type";
import { IRecord } from "@/types/storage";

export interface IGroup extends IRecord{
    name: string,
    agents: string[],
    conversation: IMessage[],
}
