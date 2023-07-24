import { IRecord } from "@/types/storage";
import { RecordMap } from "./recordProvider";

export function extract<T extends IRecord>(properties: RecordMap<T>){
    return function<TActual extends T>(obj: TActual): T{
        return Object.keys(properties).reduce<{}>((acc, key) => {
            Object.assign(acc, { [key]: Object.getOwnPropertyDescriptor(obj, key)?.value })

            return acc;
        }, {}) as T;
    }
}

export interface IJsonConverter<T> {
    serialize(obj: T): string;
    deserialize(json: string): T;
}
