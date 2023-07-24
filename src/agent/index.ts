import { IChatAgent, IZeroshotAgentMessage, initializeChatAgentExecutor } from "./chatAgent";
import { ChatAgentConfigPanel, MarkdownMessage } from "./chatAgentConfigPanel";
import { AgentProvider } from "./agentProvider";

AgentProvider.registerProvider(
            "agent.chat",
            (agent) => initializeChatAgentExecutor(agent as IChatAgent),
            (agent, onConfigChange) => ChatAgentConfigPanel(agent as IChatAgent, onConfigChange),
            {
                type: "agent.chat",
                prefixPrompt: "you are a chatbot in a chat room. Try to be helpful and friendly.",
                suffixPrompt: `Your response:`,
                useMarkdown: true,
                includeHistory: true,
                includeName: true,
            } as IChatAgent);