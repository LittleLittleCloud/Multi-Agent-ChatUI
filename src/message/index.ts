import { IMarkdownMessageRecord, MarkdownMessage } from "./MarkdownMessage";
import { MessageProvider } from "./messageProvider";

MessageProvider.registerProvider<IMarkdownMessageRecord>(
    "message.markdown",
    (message) => message,
    (message, onChange) => MarkdownMessage(message, onChange),
    {
        type: "message.markdown",
        content: "",
    } as IMarkdownMessageRecord);