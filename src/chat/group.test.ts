import { GroupChat } from "./group";
import { Logger } from "@/utils/logger";
import { AgentProvider } from "@/agent/agentProvider";
import { IMarkdownMessageRecord } from "@/message/MarkdownMessage";
import { IAgentRecord } from "@/agent/type";
import { AzureGPT, IAzureGPTRecord } from "@/model/azure/GPT";
import { GPTAgent } from "@/agent/gptAgent";
import { IChatMessageRecord } from "@/message/type";

test('multi-agent response test', async () => {
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
    const AZURE_API_ENDPOINT = process.env.AZURE_API_ENDPOINT;
    const AZURE_GPT_3_5_TURBO_16K = process.env.AZURE_GPT_3_5_TURBO_16K;
    var llm = new AzureGPT({
        deploymentID: AZURE_GPT_3_5_TURBO_16K,
        apiKey: AZURE_OPENAI_API_KEY,
        endpoint: AZURE_API_ENDPOINT,
        temperature: 0,
    });

    var alice = new GPTAgent(
        {
            name: "alice",
            system_message: 'say hello',
            llm: llm,
        }
    );

    var bob = new GPTAgent(
        {
            name: "bob",
            system_message: 'say hi',
            llm: llm,
        }
    );

    var groupChat = new GroupChat({
        name: "group",
        llm: llm,
        admin: alice,
        agents: [bob],
    });

    groupChat.addInitialConversation("hello", alice);
    groupChat.addInitialConversation("hi", bob);
    var nextMessage = {
        from: alice.name,
        role: 'user',
        content: 'hello bob',
    } as IChatMessageRecord;
    var nextMessages = await groupChat.callAsync([nextMessage], 1);
    expect(nextMessages.length).toBe(2);
    expect(nextMessages[0].from).toBe(alice.name);
    expect(nextMessages[0].content).toBe("hello bob");
    expect(nextMessages[1].from).toBe(bob.name);
})
