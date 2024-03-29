import { IAgentRecord, IAgent, AgentCallParams } from "./type";
import { IChatMessageRecord } from "@/message/type";
import { IEmbeddingModel, IChatModelRecord } from "@/model/type";
import { IMemory } from "@/memory/type";
import { Logger } from "@/utils/logger";
import { AzureGPT, IAzureGPTRecord } from "@/model/azure/GPT";
import { IOpenAIGPTRecord } from "@/model/openai/GPT";
import { LLMProvider } from "@/model/llmprovider";
import { FunctionDefinition } from "@azure/openai";

export interface IGPTAgentRecord extends IAgentRecord {
    type: 'agent.gpt';
    llm?: IAzureGPTRecord | IOpenAIGPTRecord;
    memory?: IMemory;
    embedding?: IEmbeddingModel;
    name: string;
    group_message?: string;
    system_message: string;
    avatar: string; // url
};


export class GPTAgent implements IAgent, IGPTAgentRecord {
  name: string
  type: "agent.gpt";
  llm?: IAzureGPTRecord | IOpenAIGPTRecord | undefined;
  memory?: IMemory | undefined;
  embedding?: IEmbeddingModel | undefined;
  system_message: string;
  group_message?: string;
  avatar: string;
  function_map?: Map<FunctionDefinition, (arg: string) => Promise<string>>;

  constructor(agent: Partial<IGPTAgentRecord & {function_map: Map<FunctionDefinition, (arg: string) => Promise<string>>}>) {
    Logger.debug("initialize chat agent executor");
    this.name = agent.name ?? "GPT";
    this.type = 'agent.gpt';
    this.llm = agent.llm;
    this.memory = agent.memory;
    this.embedding = agent.embedding;
    this.system_message = agent.system_message ?? "You are a helpful AI assistant";
    this.avatar = agent.avatar ?? "GPT";
    this.function_map = agent.function_map;
    this.group_message = agent.group_message ?? "Hey";
  }

  async callAsync(params: AgentCallParams): Promise<IChatMessageRecord> {
    var llmRecord = this.llm;
    if (!llmRecord) {
      throw new Error("No llm provided");
    }
    var system_msg = {
      role: "system",
      content: `Your name is ${this.name}, ${this.system_message}`,
    } as IChatMessageRecord;
    var llmProvider = LLMProvider.getProvider(llmRecord);
    var llm = llmProvider(llmRecord);
    var msg = await llm.getChatCompletion({
      messages: [system_msg, ...params.messages],
      temperature: params.temperature,
      maxTokens: params.maxTokens,
      stop: params.stopWords,
      functions: this.function_map ? Array.from(this.function_map.keys()) : undefined,
    });
    msg.from = this.name;
    // if message is a function_call, execute the function
    if(msg.functionCall != undefined && this.function_map != undefined){
      var functionDefinitions = Array.from(this.function_map?.keys() ?? []);
      var functionDefinition = functionDefinitions.find(f => f.name == msg.functionCall!.name);
      var func = functionDefinition ? this.function_map.get(functionDefinition) : undefined;
      if(func){
        try{
          var result = await func(msg.functionCall.arguments);
          msg.content = result;
          msg.name = msg.functionCall.name;
        }
        catch(e){
          var errorMsg = `Error executing function ${msg.functionCall.name}: ${e}`;
          msg.content = errorMsg;
          msg.name = msg.functionCall.name;
        }
      }
      else{
        var availableFunctions = Array.from(this.function_map?.keys() ?? []);
        var errorMsg = `Function ${msg.functionCall.name} not found. Available functions: ${availableFunctions.map(f => f.name).join(", ")}`;
        msg.content = errorMsg;
        msg.functionCall = undefined;
      }

      return msg;
    }
    else{
      return msg;
    }
  }
}

export function initializeGPTAgent(agent: IGPTAgentRecord, history?: IChatMessageRecord[]): IAgent {
    if (!agent.llm) {
        throw new Error("No llm provided");
    }

    var agentExecutor = new GPTAgent(agent);

    return agentExecutor;
}
