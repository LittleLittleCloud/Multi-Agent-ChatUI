import { IRecord } from "@/types/storage";
import { extract } from "./convertJson";

export type RecordMap<T extends IRecord> = {
    [P in keyof T]-?: true | false;
}

const recordMaps: Record<string, RecordMap<IRecord>> = {};

export function registerRecordMap<T extends IRecord>(name: string, recordMap: RecordMap<T>){
    recordMaps[name] = recordMap;
}

export function extractRecord<T extends IRecord>(instance: T) : IRecord{
    var map = recordMaps[instance.type];
    var extractor = extract<IRecord>(map);
    return extractor(instance);
}
