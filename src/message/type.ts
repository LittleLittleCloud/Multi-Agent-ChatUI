import { IRecord } from '@/types/storage';
export type Role = 'assistant' | 'user' | 'system' | 'function';

export interface IFunctionCall
{
  name: string;
  arguments: string;
}

export interface IChatMessageRecord extends IRecord {
  role: Role;
  content?: string;
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