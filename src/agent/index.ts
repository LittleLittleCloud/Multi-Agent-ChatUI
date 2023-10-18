import {IGPTAgentRecord, initializeGPTAgent } from "./gptAgent";
import { GPTAgentConfigPanel } from "./gptAgentConfigPanel";
import { AgentProvider } from "./agentProvider";

// register gptAgent
AgentProvider.registerProvider(
            "agent.gpt",
            (agent) => {
                if (agent.type != "agent.gpt") {
                    throw new Error("Invalid agent type");
                } else {
                    const gpt_record: IGPTAgentRecord = {
                        ...agent,
                        type: "agent.gpt",
                    };

                    return initializeGPTAgent(gpt_record);
                }
            },
            (agent, onConfigChange) => {
                if (agent.type != "agent.gpt") {
                    throw new Error("Invalid agent type");
                }

                var gpt_record: IGPTAgentRecord = {
                    ...agent,
                    type: "agent.gpt",
                };

                return GPTAgentConfigPanel(gpt_record, onConfigChange);
            },
            {
                type: "agent.gpt",
                name: "GPT Agent",
                system_message: "you are a helpful ai assistant",
            } as IGPTAgentRecord);