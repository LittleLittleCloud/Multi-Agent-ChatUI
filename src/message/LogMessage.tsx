import { TinyLabel } from "@/components/Global/EditableSavableTextField";
import { IMessageRecord } from "./type";
import { TinyGrayBadge, TinyGreenBadge } from "@/components/Global/Badge";
import { Collapse } from "@mui/material";
import { useState } from "react";
export const LogMessageTypeString: LogMessageType = 'message.log';
export type LogMessageType = 'message.log';
export type LogMessageLevel = 'info' | 'warning' | 'error' | 'debug' | 'verbose';

export const LogLevelsToPresent = (logLevel: LogMessageLevel) => {
    const levels: LogMessageLevel[] = ['error', 'warning', 'info', 'debug', 'verbose'];
    return levels.slice(0, levels.indexOf(logLevel) + 1);
}

export interface ILogMessageRecord extends IMessageRecord {
    type: LogMessageType,
    level: LogMessageLevel,
    detail?: string,
}

export const LogMessage = (message: ILogMessageRecord) => {
    const [showDetail, setShowDetail] = useState(false);
    console.log(message.detail?.split('\n'));
    return ( message.detail == undefined ?
        <div
            className="space-x-2 flex">
            {message.level == 'debug' && <TinyGreenBadge>debug</TinyGreenBadge>}
            {message.level == 'verbose' && <button className="border-solid rounded bg-neutral-400 w-14 flex justify-center text-xs text-slate-200 font-apple-system">verbose</button>}
            {message.level == 'info' && <button className="border-solid rounded bg-green-400 w-14 flex justify-center text-xs text-slate-200 font-apple-system">info</button>}
            {message.level == 'warning' && <button className="border-solid rounded bg-yellow-400 w-14 flex justify-center text-xs text-slate-200 font-apple-system">warning</button>}
            {message.level == 'error' && <button className="border-solid rounded bg-red-400 w-14 flex justify-center text-xs text-slate-200 font-apple-system">error</button>}
            <TinyLabel>{message.content}</TinyLabel>
        </div>
        :
        <div
            className="space-y-2 flex-col">
            <div className="space-x-2 flex">
                {message.level == 'debug' && <TinyGreenBadge>debug</TinyGreenBadge>}
                {message.level == 'verbose' && <button className="border-solid rounded bg-neutral-400 w-14 flex justify-center text-xs text-slate-200 font-apple-system">verbose</button>}
                {message.level == 'info' && <button className="border-solid rounded bg-green-400 w-14 flex justify-center text-xs text-slate-200 font-apple-system">info</button>}
                {message.level == 'warning' && <button className="border-solid rounded bg-yellow-400 w-14 flex justify-center text-xs text-slate-200 font-apple-system">warning</button>}
                {message.level == 'error' && <button className="border-solid rounded bg-red-400 w-14 flex justify-center text-xs text-slate-200 font-apple-system">error</button>}
                <TinyLabel>{message.content}</TinyLabel>
                <button
                    className="border-solid rounded bg-neutral-400 w-14 flex justify-center text-xs text-slate-200 font-apple-system"
                    onClick={() => setShowDetail(!showDetail)}>
                    detail
                </button>
            </div>
            <Collapse in={showDetail}>
                <TinyLabel>{message.detail}</TinyLabel>
            </Collapse>
        </div>
    )
}

