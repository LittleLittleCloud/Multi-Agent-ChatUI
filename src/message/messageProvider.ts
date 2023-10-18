import { Provider } from "@/utils/app/provider";
import { IMessageRecord } from "./type";

export const MessageProvider = new Provider<IMessageRecord, (config: IMessageRecord) => IMessageRecord>();
