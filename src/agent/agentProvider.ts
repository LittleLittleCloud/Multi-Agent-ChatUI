import { Provider } from "@/utils/app/provider";
import { IAgentRecord, IAgent } from "./type";

export const AgentProvider = new Provider<IAgentRecord, (config: IAgentRecord) => IAgent>();
