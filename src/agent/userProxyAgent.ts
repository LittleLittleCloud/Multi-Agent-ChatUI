import { IChatMessageRecord } from "@/message/type";
import { AgentCallParams, IAgent } from "./type";

export class UserProxyAgent implements IAgent{
    public name: string;
    
    constructor(
        name: string,
        ){
        this.name = name;
    }
    
    public async callAsync(params: AgentCallParams): Promise<IChatMessageRecord>{
        throw new Error("Method not implemented.");
    }
}