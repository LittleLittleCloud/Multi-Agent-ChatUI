import { IChatAgent } from "@/agent/chatAgent";
import { IGPT } from "@/model/openai/GPT"
import { MultiAgentGroup } from "./group";
import { Logger } from "@/utils/logger";
import { AgentProvider } from "@/agent/agentProvider";
import { IMarkdownMessage } from "@/message/MarkdownMessage";
import { IAgent } from "@/agent/type";

test('multi-agent response test', async () => {
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    var llm: IGPT = {
        type: "openai.gpt-35-turbo",
        isChatModel: true,
        model: "gpt-3.5-turbo",
        apiKey: OPENAI_API_KEY,
        isStreaming: true,
        maxTokens: 64,
        temperature: 0.5,
        topP: 1,
        frequencyPenalty: 0,
    } as IGPT;

    var alice: IChatAgent = {
        type: 'agent.chat',
        alias: "alice",
        description: "an enthusiastic bot with rich knowledge over computer science",
        avatar: "test",
        includeHistory: true,
        suffixPrompt: "alice:",
        includeName: true,
        useMarkdown: true,
        llm: llm,
    } as IChatAgent;

    var bob: IChatAgent = {
        type: 'agent.chat',
        alias: "bob",
        description: "an enthusiastic bot with rich knowledge over real estate",
        avatar: "test",
        includeHistory: true,
        includeName: true,
        useMarkdown: true,
        suffixPrompt: "bob:",
        llm: llm,
    } as IChatAgent;

    var user: IAgent = {
        alias: "Human",
        description: "a user seeks for help, won't respond unless being mentioned",
        avatar: "test",
    } as IAgent;

    var group = new MultiAgentGroup(user, [alice, bob], []);
    var userMessage = {
        from: 'Human',
        content: 'hello bob, I want to buy a house',
        type: 'message.markdown',
    };

    group.pushMessage(userMessage);
    var nextAgent = await group.selectNextSpeaker();
    expect(nextAgent.alias).toBe(bob.alias);
})

test('multi-agent computer-real-restate conversation test', async () => {
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    var llm: IGPT = {
        type: "openai.gpt-35-turbo",
        isChatModel: true,
        model: "gpt-3.5-turbo-0613",
        apiKey: OPENAI_API_KEY,
        isStreaming: true,
        maxTokens: 256,
        temperature: 0,
        topP: 1,
        frequencyPenalty: 0,
    } as IGPT;

    var alice: IChatAgent = {
        type: 'agent.chat',
        alias: "alice",
        description: "a computer scientist",
        avatar: "test",
        includeHistory: true,
        suffixPrompt: "alice:",
        includeName: true,
        useMarkdown: true,
        llm: llm,
    } as IChatAgent;

    var bob: IChatAgent = {
        type: 'agent.chat',
        alias: "bob",
        description: "a real estate agent",
        avatar: "test",
        includeHistory: true,
        includeName: true,
        useMarkdown: true,
        suffixPrompt: "bob:",
        llm: llm,
    } as IChatAgent;

    var user: IAgent = {
        alias: "Human",
        description: "a user seeks for help, won't respond unless being mentioned",
        avatar: "test",
    } as IAgent;

    var group = new MultiAgentGroup(user, [alice, bob], []);
    var userMessage = {
        from: group.user.alias,
        content: 'hello, I want to buy a house',
        type: 'message.markdown',
    };

    var nextMessage = await group.rolePlayWithMaxRound(userMessage, 5);
    expect(nextMessage.from).toBe(group.user.alias);
    expect(nextMessage.content).not.toBe(group.TERMINATE_MESSAGE.content);
})

test('python-math-chat test', async () => {
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    var llm: IGPT = {
        type: "openai.gpt-35-turbo",
        isChatModel: true,
        model: "gpt-3.5-turbo-0613",
        apiKey: OPENAI_API_KEY,
        isStreaming: true,
        maxTokens: 256,
        temperature: 0,
        topP: 1,
        frequencyPenalty: 0,
    } as IGPT;

    var teacher: IChatAgent = {
        type: 'agent.chat',
        alias: "teacher",
        description: "a teacher",
        avatar: "test",
        includeHistory: true,
        suffixPrompt: "teacher:",
        includeName: true,
        useMarkdown: true,
        llm: llm,
    } as IChatAgent;

    var student: IChatAgent = {
        type: 'agent.chat',
        alias: "student",
        description: "a student",
        avatar: "test",
        includeHistory: true,
        includeName: true,
        useMarkdown: true,
        suffixPrompt: "student:",
        llm: llm,
    } as IChatAgent;

    var user: IAgent = {
        alias: "Human",
        description: "a user seeks for help, won't respond unless being mentioned",
        avatar: "test",
    } as IAgent;

    var group = new MultiAgentGroup(user, [teacher, student], []);
    var userMessage = {
        from: user.alias,
        content: 'hello, teacher, teach student on how to resolve 1+2+3+...+100 in python? And report back to me when you are done.',
        type: 'message.markdown',
    } as IMarkdownMessage;

    var nextMessage = await group.rolePlayWithMaxRound(userMessage, 10);
    expect(nextMessage.from).toBe(group.user.alias);
    expect(nextMessage.content).not.toBe(group.TERMINATE_MESSAGE.content);
})

test('single-agent max-vote test', async () => {
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    var llm: IGPT = {
        type: "openai.gpt-35-turbo",
        isChatModel: true,
        model: "gpt-3.5-turbo-0613",
        apiKey: OPENAI_API_KEY,
        isStreaming: true,
        maxTokens: 1024,
        temperature: 0,
        topP: 1,
        frequencyPenalty: 0,
    } as IGPT;

    var alice: IChatAgent = {
        type: 'agent.chat',
        alias: "alice",
        description: "a computer scientist",
        avatar: "test",
        includeHistory: true,
        suffixPrompt: "alice:",
        includeName: true,
        useMarkdown: true,
        llm: llm,
    } as IChatAgent;

    var user: IAgent = {
        alias: "Human",
        description: "a user seeks for help",
        avatar: "test",
    } as IAgent;

    var group = new MultiAgentGroup(user, [alice], []);

    var userMessage = {
        from: group.user.alias,
        content: 'hello, I want to buy a house',
        type: 'message.markdown',
    };
    var nextMessage = await group.rolePlay(userMessage);
    expect(nextMessage.from).toBe(alice.alias);
    nextMessage = await group.rolePlay(nextMessage);
    expect(nextMessage.from).toBe(group.user.alias);
})
