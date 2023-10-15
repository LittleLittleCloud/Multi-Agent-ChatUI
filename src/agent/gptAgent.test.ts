import { IOpenAIGPTRecord } from "@/model/openai/GPT";
import { IChatMessage, IChatMessageRecord } from "@/message/type";
import { Logger } from "@/utils/logger";
import { AzureGPT, IAzureGPTRecord } from "@/model/azure/GPT";
import { GPTAgent, IGPTAgentRecord } from "./gptAgent";

test('gpt agent callAsync test', async () => {
    const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
    const AZURE_API_ENDPOINT = process.env.AZURE_API_ENDPOINT;
    const AZURE_GPT_3_5_TURBO_16K = process.env.AZURE_GPT_3_5_TURBO_16K;
    var llm = new AzureGPT(
        {
            type: "azure.gpt",
            deploymentID: AZURE_GPT_3_5_TURBO_16K,
            isChatModel: true,
            apiKey: AZURE_OPENAI_API_KEY,
            isStreaming: true,
            maxTokens: 64,
            temperature: 0.5,
            topP: 1,
            endpoint: AZURE_API_ENDPOINT,
            frequencyPenalty: 0,
        } as IAzureGPTRecord,
    );

    var agent = new GPTAgent(
        {
            name: "alice",
            system_message: `Just say 'hello world' to every message
e.g.
hello world`,
            avatar: "test",
            llm: llm,
        });

    var userMessage = {
        role: 'user',
        content: 'hello',
    } as IChatMessage;

    var response = await agent.callAsync([userMessage], 0);

    expect(response.content).toBe("hello world");
})

