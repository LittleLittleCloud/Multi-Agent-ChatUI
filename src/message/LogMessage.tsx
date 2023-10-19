import { TinyLabel } from "@/components/Global/EditableSavableTextField";
import { IMessageRecord } from "./type";
import { TinyGrayBadge, TinyGreenBadge } from "@/components/Global/Badge";

export const LogMessageTypeString: LogMessageType = 'message.log';
export type LogMessageType = 'message.log';
export type LogMessageLevel = 'info' | 'warning' | 'error' | 'debug' | 'verbose';

export const LogLevelsToPresent = (logLevel: LogMessageLevel) => {
    const levels: LogMessageLevel[] = ['info', 'warning', 'error', 'debug', 'verbose'];
    return levels.slice(0, levels.indexOf(logLevel) + 1);
}

export interface ILogMessageRecord extends IMessageRecord {
    type: LogMessageType,
    level: LogMessageLevel,
    detail?: string,
}

export const LogMessage = (message: ILogMessageRecord) => {
    return (
        <div
            className="space-x-2 flex">
            {message.level == 'debug' && <TinyGreenBadge>debug</TinyGreenBadge>}
            {message.level == 'verbose' && <button className="border-solid rounded bg-neutral-400 w-14 flex justify-center text-xs text-slate-200 font-apple-system">verbose</button>}
            {message.level == 'info' && <button className="border-solid rounded bg-green-400 w-14 flex justify-center text-xs text-slate-200 font-apple-system">info</button>}
            <TinyLabel>{message.content}</TinyLabel>
        </div>
    )
}

