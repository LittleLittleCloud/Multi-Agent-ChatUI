import { LogMessageLevel } from "@/message/LogMessage";
import { IChatMessageRecord, IMessageRecord } from "@/message/type";
import { IChatModelRecord } from "@/model/type";
import { IRecord } from "@/types/storage";

export const GroupTypeString: GroupType = 'group';
export type GroupType = 'group';
export type SelectSpeakerMode = 'auto' | 'manual' | 'semi-auto'
export interface IGroupRecord extends IRecord{
    type: GroupType;
    name: string;
    agentNames: string[];
    conversation: IMessageRecord[];
    llmModel?: IChatModelRecord;
    logLevel?: LogMessageLevel;
    maxRound?: number;
    selectSpeakerMode?: SelectSpeakerMode;
    initialMessages?: IChatMessageRecord[];
}

export interface IGroup extends IGroupRecord{
    callAsync(
        messages: IChatMessageRecord[],
        max_round?: number) : Promise<IChatMessageRecord[]>;
}
