import { Provider } from "@/utils/app/provider";
import { IAgent, IAgentExecutor } from "./type";

export const AgentProvider = new Provider<IAgent, (config: IAgent) => IAgentExecutor >();
