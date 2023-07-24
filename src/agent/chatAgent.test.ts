import { ChatAgentExecutor, IChatAgent } from "./chatAgent";
import { IGPT35Turbo } from "@/model/openai/GPT";
import { IMessage } from "@/message/type";
import { Logger } from "@/utils/logger";


test('chat agent map ask test', async () => {
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    var agent: IChatAgent = {
        type: 'agent.chat',
        alias: "test",
        description: "test",
        avatar: "test",
        includeHistory: true,
        includeName: true,
        useMarkdown: true,
        llm: {
            type: "openai.gpt-35-turbo",
            isChatModel: true,
            model: "gpt-3.5-turbo",
            apiKey: OPENAI_API_KEY,
            isStreaming: true,
            maxTokens: 64,
            temperature: 0,
            topP: 1,
            frequencyPenalty: 0,
        } as IGPT35Turbo,
    };

    var agentExecutor = new ChatAgentExecutor(agent);
    var chatHistory: IMessage[] = [
        {
            from: 'alice',
            content: 'hello, bob',
        } as IMessage,
    ]

    var candidate_messages: IMessage[] = [
        {
            from: 'bob',
            content: 'hello, alice',
        } as IMessage,
        {
            from: 'alice',
            content: 'hello, bob',
        } as IMessage,
    ]
    var index = await agentExecutor.ask(candidate_messages, chatHistory);
    expect(index).toBe(0);
})