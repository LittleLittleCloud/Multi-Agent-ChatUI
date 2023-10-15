import { IRecord } from '@/types/storage';
export type Role = 'assistant' | 'user' | 'system' | 'function';

export interface IFunctionCall
{
  name: string;
  arguments: string;
}

export interface IChatMessage {
  role: Role;
  content: string;
  name?: string;
  function_call?: IFunctionCall;
}

export interface IChatMessageRecord extends IRecord, IChatMessage{
  timestamp?: number,
}

export function IsUserMessage(message: IChatMessageRecord): boolean{
  return message.role === "user";
}

export function IsFunctionCallMessage(message: IChatMessageRecord): boolean{
  return message.function_call !== undefined;
}