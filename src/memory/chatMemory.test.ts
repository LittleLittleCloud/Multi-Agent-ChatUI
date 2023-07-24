import { IMessage } from "@/message/type";
import { ChatMemory } from "./chatMemory";

test('ChatMemory can parse history using ChatML', async () => {
    var chatHistory: IMessage[] = [
        {from: "user", content: "hello", type: "message.plainText"},
        {from: "assistant", content: "hi", type: "message.plainText"},
        {from: "user", content: "how are you?", type: "message.plainText"},
        {from: "assistant", content: "I'm fine", type: "message.plainText"},
    ];

    var chatMemory = new ChatMemory({history: chatHistory, useChatML: true});
    var memoryVariables = await chatMemory.loadMemoryVariables({});
    var expected = `<|im_start|>user
hello
<|im_end|>
<|im_start|>assistant
hi
<|im_end|>
<|im_start|>user
how are you?
<|im_end|>
<|im_start|>assistant
I'm fine
<|im_end|>`;
    expect(memoryVariables["history"]).toBe(expected);
})

test('ChatMemory can parse history using plain text', async () => {
    var chatHistory: IMessage[] = [
        {from: "user", content: "hello", type: "message.plainText"},
        {from: "assistant", content: "hi", type: "message.plainText"},
        {from: "user", content: "how are you?", type: "message.plainText"},
        {from: "assistant", content: "I'm fine", type: "message.plainText"},
    ];

    var chatMemory = new ChatMemory({history: chatHistory});
    var memoryVariables = await chatMemory.loadMemoryVariables({});
    var expected = `user:hello
assistant:hi
user:how are you?
assistant:I'm fine`;
    expect(memoryVariables["history"]).toBe(expected);
})