import { IOpenAIGPTRecord } from "@/model/openai/GPT";
import { IChatMessageRecord } from "@/message/type";
import { Logger } from "@/utils/logger";
import { AzureGPT, IAzureGPTRecord } from "@/model/azure/GPT";
import { GPTAgent, IGPTAgentRecord } from "./gptAgent";
import { AzureKeyCredential, FunctionDefinition, OpenAIClient } from "@azure/openai";
import { LLMProvider } from "@/model/llmprovider";

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

    expect(LLMProvider.getDefaultValue("azure.gpt") instanceof AzureGPT).toBe(true);

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
    } as IChatMessageRecord;

    var response = await agent.callAsync({
        messages: [userMessage],
        temperature: 0,
    });

    expect(response.content).toBe("hello world");
})

test('gpt agent callAsync function_call test', async () => {
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

    var say_hi_function_definition: FunctionDefinition = {
        name: "say_hi",
        description: "say hi",
        parameters: {
            type: "object",
            properties: {
              name:{
                type: "string",
                description: "name of the person",
              },
            },
            required: ["name"],
          }
    };

    var say_hi_function = async (args: string) => {
        var name = JSON.parse(args).name;
        return `[SAY_HI_FUNCTION] hi ${name}`;
    }

    var agent = new GPTAgent(
        {
            name: "alice",
            system_message: `replying using say_hi function`,
            avatar: "test",
            llm: llm,
            function_map: new Map<FunctionDefinition, (arg: string) => Promise<string>>([
                [say_hi_function_definition, say_hi_function]
            ]),
        });

    var userMessage = {
        role: 'user',
        content: 'hi I am you dad',
    } as IChatMessageRecord;

    var response = await agent.callAsync({
        messages: [userMessage],
        temperature: 0,
    });
    expect(response.functionCall?.name).toBe("say_hi");
    expect(response.role).toBe("assistant");
    expect(response.content).toContain("[SAY_HI_FUNCTION]");
    expect(response.from).toBe("alice");
})

