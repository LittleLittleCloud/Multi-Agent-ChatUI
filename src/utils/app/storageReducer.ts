import { IAgentRecord } from "@/agent/type";
import { IGroupRecord } from "@/chat/type";
import { IChatMessageRecord } from "@/message/type";
import { IStorageRecord } from "@/types/storage";

export type StorageCmd = "set" | "get"
    | "setGroups"
    | "setAgents"
    | "addAgent"
    | "removeAgent"
    | "updateAgent"
    | "addOrUpdateAgent"
    | "addGroup"
    | "removeGroup"
    | "updateGroup"
    | "addOrUpdateGroup";


export type StorageAction = {type: StorageCmd, payload?: IStorageRecord | IGroupRecord[] | IAgentRecord[] | IAgentRecord | IGroupRecord | IChatMessageRecord, original?: IAgentRecord | IGroupRecord};

export function storageReducer(storage: IStorageRecord, action: StorageAction) : IStorageRecord{
    switch(action.type){
        case "set":
            return action.payload as IStorageRecord;
        case "get":
            return storage;
        case "setGroups":
            return {...storage, groups: action.payload as IGroupRecord[]};
        case "setAgents":
            return {...storage, agents: action.payload as IAgentRecord[]};
        case "addAgent":
            if(storage.agents.find(a => a.name === (action.payload as IAgentRecord)!.name)){
                throw new Error("Agent already exists");
            }
            return {...storage, agents: [...storage.agents, action.payload as IAgentRecord]};
        case "removeAgent":
            return {...storage, agents: storage.agents.filter(a => a.name !== (action.payload as IAgentRecord)!.name)};
        case "updateAgent":
            var originalAlias = (action.original as IAgentRecord)?.name ?? (action.payload as IAgentRecord)!.name;
            return {...storage, agents: storage.agents.map(a => a.name === originalAlias ? action.payload as IAgentRecord : a)};
        case "addOrUpdateAgent":
            var existing = storage.agents.find(a => a.name === (action.payload as IAgentRecord)!.name);
            if(existing){
                return {...storage, agents: storage.agents.map(a => a.name === (action.payload as IAgentRecord)!.name ? action.payload as IAgentRecord : a)};
            }
            return {...storage, agents: [...storage.agents, action.payload as IAgentRecord]};
        case "addGroup":
            if(storage.groups.find(a => a.name === (action.payload as IGroupRecord)!.name)){
                throw new Error("Group already exists");
            }
            return {...storage, groups: [...storage.groups, action.payload as IGroupRecord]};
        case "removeGroup":
            return {...storage, groups: storage.groups.filter(a => a.name !== (action.payload as IGroupRecord)!.name)};
        case "updateGroup":
            var originalAlias = (action.original as IGroupRecord)?.name ?? (action.payload as IGroupRecord)!.name;
            return {...storage, groups: storage.groups.map(a => a.name === originalAlias ? action.payload as IGroupRecord : a)};
        case "addOrUpdateGroup":
            var groupExisting = storage.groups.find(a => a.name === (action.payload as IGroupRecord)!.name) ?? false;
            if(groupExisting){
                return {...storage, groups: storage.groups.map(a => a.name === (action.payload as IGroupRecord)!.name ? action.payload as IGroupRecord : a)};
            }
            return {...storage, groups: [...storage.groups, action.payload as IGroupRecord]};
        default:
            throw new Error("Invalid storage command");
    }
}