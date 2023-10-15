import { IChatAgent } from "@/agent/chatAgent";
import { MultiAgentGroup } from "./group";
import { Logger } from "@/utils/logger";
import { AgentProvider } from "@/agent/agentProvider";
import { IMarkdownMessage } from "@/message/MarkdownMessage";
import { IAgentRecord } from "@/agent/type";
import { IAzureGPTRecord } from "@/model/azure/GPT";

test('multi-agent response test', async () => {
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
    var llm: IAzureGPTRecord = {
        type: "azure.gpt",
        deploymentID: "gpt-3.5-turbo-16k",
        isChatModel: true,
        apiKey: AZURE_OPENAI_API_KEY,
        isStreaming: true,
        maxTokens: 64,
        temperature: 0.5,
        topP: 1,
        frequencyPenalty: 0,
    } as IAzureGPTRecord;

    var alice: IChatAgent = {
        type: 'agent.chat',
        name: "alice",
        system_message: "an enthusiastic bot with rich knowledge over computer science",
        avatar: "test",
        includeHistory: true,
        suffixPrompt: "alice:",
        includeName: true,
        useMarkdown: true,
        llm: llm,
    } as IChatAgent;

    var bob: IChatAgent = {
        type: 'agent.chat',
        name: "bob",
        system_message: "an enthusiastic bot with rich knowledge over real estate",
        avatar: "test",
        includeHistory: true,
        includeName: true,
        useMarkdown: true,
        suffixPrompt: "bob:",
        llm: llm,
    } as IChatAgent;

    var user: IAgentRecord = {
        name: "Human",
        system_message: "a user seeks for help, won't respond unless being mentioned",
        avatar: "test",
    } as IAgentRecord;

    var group = new MultiAgentGroup(user, [alice, bob], []);
    var userMessage = {
        from: 'Human',
        content: 'hello bob, I want to buy a house',
        type: 'message.markdown',
    };

    group.pushMessage(userMessage);
    var nextAgent = await group.selectNextSpeaker();
    expect(nextAgent.name).toBe(bob.name);
})

test('multi-agent computer-real-restate conversation test', async () => {
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    var llm: IAzureGPTRecord = {
        type: "openai.gpt-35-turbo",
        isChatModel: true,
        model: "gpt-3.5-turbo-0613",
        apiKey: OPENAI_API_KEY,
        isStreaming: true,
        maxTokens: 256,
        temperature: 0,
        topP: 1,
        frequencyPenalty: 0,
    } as IAzureGPTRecord;

    var alice: IChatAgent = {
        type: 'agent.chat',
        name: "alice",
        system_message: "a computer scientist",
        avatar: "test",
        includeHistory: true,
        suffixPrompt: "alice:",
        includeName: true,
        useMarkdown: true,
        llm: llm,
    } as IChatAgent;

    var bob: IChatAgent = {
        type: 'agent.chat',
        name: "bob",
        system_message: "a real estate agent",
        avatar: "test",
        includeHistory: true,
        includeName: true,
        useMarkdown: true,
        suffixPrompt: "bob:",
        llm: llm,
    } as IChatAgent;

    var user: IAgentRecord = {
        name: "Human",
        system_message: "a user seeks for help, won't respond unless being mentioned",
        avatar: "test",
    } as IAgentRecord;

    var group = new MultiAgentGroup(user, [alice, bob], []);
    var userMessage = {
        from: group.user.name,
        content: 'hello, I want to buy a house',
        type: 'message.markdown',
    };

    var nextMessage = await group.rolePlayWithMaxRound(userMessage, 5);
    expect(nextMessage.from).toBe(group.user.name);
    expect(nextMessage.content).not.toBe(group.TERMINATE_MESSAGE.content);
})

test('python-math-chat test', async () => {
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    var llm: IAzureGPTRecord = {
        type: "openai.gpt-35-turbo",
        isChatModel: true,
        model: "gpt-3.5-turbo-0613",
        apiKey: OPENAI_API_KEY,
        isStreaming: true,
        maxTokens: 256,
        temperature: 0,
        topP: 1,
        frequencyPenalty: 0,
    } as IAzureGPTRecord;

    var teacher: IChatAgent = {
        type: 'agent.chat',
        name: "teacher",
        system_message: "a teacher",
        avatar: "test",
        includeHistory: true,
        suffixPrompt: "teacher:",
        includeName: true,
        useMarkdown: true,
        llm: llm,
    } as IChatAgent;

    var student: IChatAgent = {
        type: 'agent.chat',
        name: "student",
        system_message: "a student",
        avatar: "test",
        includeHistory: true,
        includeName: true,
        useMarkdown: true,
        suffixPrompt: "student:",
        llm: llm,
    } as IChatAgent;

    var user: IAgentRecord = {
        name: "Human",
        system_message: "a user seeks for help, won't respond unless being mentioned",
        avatar: "test",
    } as IAgentRecord;

    var group = new MultiAgentGroup(user, [teacher, student], []);
    var userMessage = {
        from: user.name,
        content: 'hello, teacher, teach student on how to resolve 1+2+3+...+100 in python? And report back to me when you are done.',
        type: 'message.markdown',
    } as IMarkdownMessage;

    var nextMessage = await group.rolePlayWithMaxRound(userMessage, 10);
    expect(nextMessage.from).toBe(group.user.name);
    expect(nextMessage.content).not.toBe(group.TERMINATE_MESSAGE.content);
})

test('single-agent max-vote test', async () => {
    const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    var llm: IAzureGPTRecord = {
        type: "openai.gpt-35-turbo",
        isChatModel: true,
        model: "gpt-3.5-turbo-0613",
        apiKey: OPENAI_API_KEY,
        isStreaming: true,
        maxTokens: 1024,
        temperature: 0,
        topP: 1,
        frequencyPenalty: 0,
    } as IAzureGPTRecord;

    var alice: IChatAgent = {
        type: 'agent.chat',
        name: "alice",
        system_message: "a computer scientist",
        avatar: "test",
        includeHistory: true,
        suffixPrompt: "alice:",
        includeName: true,
        useMarkdown: true,
        llm: llm,
    } as IChatAgent;

    var user: IAgentRecord = {
        name: "Human",
        system_message: "a user seeks for help",
        avatar: "test",
    } as IAgentRecord;

    var group = new MultiAgentGroup(user, [alice], []);

    var userMessage = {
        from: group.user.name,
        content: 'hello, I want to buy a house',
        type: 'message.markdown',
    };
    var nextMessage = await group.rolePlay(userMessage);
    expect(nextMessage.from).toBe(alice.name);
    nextMessage = await group.rolePlay(nextMessage);
    expect(nextMessage.from).toBe(group.user.name);
})
