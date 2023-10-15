import { Agent, ChatAgent, ZeroShotAgent, AgentExecutor, LLMSingleActionAgent, AgentActionOutputParser } from "langchain/agents";
import { ConversationChain } from "langchain/chains";
import {BaseLLM, LLM} from "langchain/llms/base";
import { ChatMemory, IChatMemory } from "../memory/chatMemory";
import { AgentAction, AgentFinish, AgentStep, BaseChatMessage, ChatMessage, HumanChatMessage, InputValues, PartialValues, SystemChatMessage } from "langchain/schema";
import { BasePromptTemplate, BaseStringPromptTemplate, SerializedBasePromptTemplate, renderTemplate } from "langchain/prompts";
import { RecordMap } from "@/utils/app/recordProvider";
import { LLMChain } from "langchain";
import { CallbackManager, Callbacks, ConsoleCallbackHandler, LangChainTracer } from "langchain/callbacks";
import { Tool } from "langchain/tools";
import { IAgentRecord, IAgent } from "./type";
import { IChatMessage, IChatMessageRecord } from "@/message/type";
import { IEmbeddingModel, IChatModelRecord } from "@/model/type";
import { IMemory } from "@/memory/type";
import { Logger } from "@/utils/logger";
import { AzureGPT, IAzureGPTRecord } from "@/model/azure/GPT";
import { IOpenAIGPTRecord } from "@/model/openai/GPT";
import { LLMProvider } from "@/model/llmprovider";

export interface IZeroshotAgentMessage extends IChatMessageRecord{
  type: 'message.zeroshot',
  prompt?: string,
}

export interface IGPTAgentRecord extends IAgentRecord {
    type: 'agent.gpt';
    llm?: IAzureGPTRecord | IOpenAIGPTRecord;
    memory?: IMemory;
    embedding?: IEmbeddingModel;
    name: string;
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
  avatar: string;

  constructor(agent: Partial<IGPTAgentRecord>) {
    Logger.debug("initialize chat agent executor");
    this.name = agent.name ?? "GPT";
    this.type = 'agent.gpt';
    this.llm = agent.llm;
    this.memory = agent.memory;
    this.embedding = agent.embedding;
    this.system_message = agent.system_message ?? "You are a helpful AI assistant";
    this.avatar = agent.avatar ?? "GPT";
  }

  async callAsync(messages: IChatMessage[], temperature?: number | undefined, stop_words?: string[] | undefined, max_tokens?: number | undefined): Promise<IChatMessage> {
    var llmRecord = this.llm;
    if (!llmRecord) {
      throw new Error("No llm provided");
    }
    var system_msg = {
      role: "system",
      content: `Your name is ${this.name}, ${this.system_message}`,
    } as IChatMessage;
    var llmProvider = LLMProvider.getProvider(llmRecord);
    var llm = llmProvider(llmRecord);
    var msg = await llm.getChatCompletion([
      system_msg,
      ...messages,
    ] as IChatMessage[], temperature, max_tokens, undefined, undefined, undefined, stop_words);
    msg.name = this.name;

    return msg;
  }
}

export function initializeGPTAgent(agent: IGPTAgentRecord, history?: IChatMessageRecord[]): IAgent {
    if (!agent.llm) {
        throw new Error("No llm provided");
    }

    var agentExecutor = new GPTAgent(agent);

    return agentExecutor;
}
