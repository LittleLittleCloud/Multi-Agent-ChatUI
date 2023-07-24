import { IAgent } from "@/types/agent";

export type AgentCmd = "add" | "remove" | "update" | "addOrUpdate";
export type AgentAction = {type: AgentCmd, payload: IAgent, original?: IAgent};
export function agentReducer(agents : IAgent[], action: AgentAction){
    switch(action.type){
        case "add":
            if(agents.find(a => a.alias === action.payload.alias)){
                throw new Error("Agent already exists");
            }
            return [...agents, action.payload];
        case "remove":
            return agents.filter(a => a.alias !== action.payload.alias);
        case "update":
            var originalAlias = action.original?.alias ?? action.payload.alias;
            return agents.map(a => a.alias === originalAlias ? action.payload : a);
        case "addOrUpdate":
            var existing = agents.find(a => a.alias === action.payload.alias);
            if(existing){
                return agents.map(a => a.alias === action.payload.alias ? action.payload : a);
            }
            return [...agents, action.payload];
        default:
            throw new Error("Invalid agent command");
    }
}