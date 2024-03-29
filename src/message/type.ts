import { IRecord } from '@/types/storage';
export type Role = 'assistant' | 'user' | 'system' | 'function';

export interface IFunctionCall
{
  name: string;
  arguments: string;
}

export interface IMessageRecord extends IRecord {
  content?: string;
}
export interface IChatMessageRecord extends IMessageRecord {
  role: Role;
  name?: string;
  functionCall?: IFunctionCall;
  from?: string; // agent name
  timestamp?: number;
}

export function IsUserMessage(message: IChatMessageRecord): boolean{
  return message.role === "user";
}

export function IsFunctionCallMessage(message: IChatMessageRecord): boolean{
  return message.functionCall !== undefined;
}

export function IsChatMessage(message: IMessageRecord): boolean{
  return (message as IChatMessageRecord).role !== undefined;
}