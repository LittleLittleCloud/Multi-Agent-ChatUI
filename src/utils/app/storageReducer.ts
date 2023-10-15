import { IAgentRecord } from "@/agent/type";
import { IGroup } from "@/types/group";
import { IStorage } from "@/types/storage";

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


export type StorageAction = {type: StorageCmd, payload?: IStorage | IGroup[] | IAgentRecord[] | IAgentRecord | IGroup, original?: IAgentRecord | IGroup};

export function storageReducer(storage: IStorage, action: StorageAction) : IStorage{
    switch(action.type){
        case "set":
            return action.payload as IStorage;
        case "get":
            return storage;
        case "setGroups":
            return {...storage, groups: action.payload as IGroup[]};
        case "setAgents":
            return {...storage, agents: action.payload as IAgentRecord[]};
        case "addAgent":
            if(storage.agents.find(a => a.alias === (action.payload as IAgentRecord)!.name)){
                throw new Error("Agent already exists");
            }
            return {...storage, agents: [...storage.agents, action.payload as IAgentRecord]};
        case "removeAgent":
            return {...storage, agents: storage.agents.filter(a => a.alias !== (action.payload as IAgentRecord)!.name)};
        case "updateAgent":
            var originalAlias = (action.original as IAgentRecord)?.name ?? (action.payload as IAgentRecord)!.name;
            return {...storage, agents: storage.agents.map(a => a.alias === originalAlias ? action.payload as IAgentRecord : a)};
        case "addOrUpdateAgent":
            var existing = storage.agents.find(a => a.alias === (action.payload as IAgentRecord)!.name);
            if(existing){
                return {...storage, agents: storage.agents.map(a => a.alias === (action.payload as IAgentRecord)!.name ? action.payload as IAgentRecord : a)};
            }
            return {...storage, agents: [...storage.agents, action.payload as IAgentRecord]};
        case "addGroup":
            if(storage.groups.find(a => a.name === (action.payload as IGroup)!.name)){
                throw new Error("Group already exists");
            }
            return {...storage, groups: [...storage.groups, action.payload as IGroup]};
        case "removeGroup":
            return {...storage, groups: storage.groups.filter(a => a.name !== (action.payload as IGroup)!.name)};
        case "updateGroup":
            var originalAlias = (action.original as IGroup)?.name ?? (action.payload as IGroup)!.name;
            return {...storage, groups: storage.groups.map(a => a.name === originalAlias ? action.payload as IGroup : a)};
        case "addOrUpdateGroup":
            var groupExisting = storage.groups.find(a => a.name === (action.payload as IGroup)!.name) ?? false;
            if(groupExisting){
                return {...storage, groups: storage.groups.map(a => a.alias === (action.payload as IGroup)!.alias ? action.payload as IGroup : a)};
            }
            return {...storage, groups: [...storage.groups, action.payload as IGroup]};
        default:
            throw new Error("Invalid storage command");
    }
}