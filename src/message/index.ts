import { IMarkdownMessage, MarkdownMessage } from "./MarkdownMessage";
import { MessageProvider } from "./messageProvider";

MessageProvider.registerProvider<IMarkdownMessage>(
    "message.markdown",
    (message) => message,
    (message, onChange) => MarkdownMessage(message, onChange),
    {
        type: "message.markdown",
        content: "",
    } as IMarkdownMessage);