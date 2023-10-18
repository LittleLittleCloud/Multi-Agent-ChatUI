import { SmallLabel } from "@/components/Global/EditableSavableTextField";
import { ILogMessageRecord, LogMessage } from "./LogMessage";
import { IMarkdownMessageRecord, MarkdownMessage } from "./MarkdownMessage";
import { MessageProvider } from "./messageProvider";
import { IChatMessageRecord, IMessageRecord } from "./type";

MessageProvider.registerProvider<IMarkdownMessageRecord>(
    "message.markdown",
    (message) => message,
    (message, _) => MarkdownMessage(message),
    {
        type: "message.markdown",
        content: "",
    } as IMarkdownMessageRecord);

MessageProvider.registerProvider<ILogMessageRecord>(
    "message.log",
    (message) => message,
    (message, _) => LogMessage(message),
    {
        type: "message.log",
        content: "",
    } as ILogMessageRecord
)

export const MessageElement = (props: { message: IMessageRecord, onConfigChange?: (msg: IMessageRecord) => void  }) => {
    if(!MessageProvider.hasProvider(props.message.type)){
        return <SmallLabel>{props.message.content?.toString()}</SmallLabel>
    }

    return MessageProvider.getConfigUIProvider(props.message.type)(props.message, props.onConfigChange);
}