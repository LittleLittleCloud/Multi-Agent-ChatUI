import { IRecord } from '@/types/storage';

export interface Message {
  role: Role;
  content: string;
}

export type Role = 'assistant' | 'user';
export interface IMessage extends IRecord{
  timestamp?: number,
  from: string | '__user',
  type: string,
  content: string,
  prompt?: string,
}

export function IsUserMessage(message: IMessage): boolean{
  return message.from === "__user" || message.from === "user" || message.from === "Avatar";
}