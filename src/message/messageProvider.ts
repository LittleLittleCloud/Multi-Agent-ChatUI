import { Provider } from "@/utils/app/provider";
import { IChatMessageRecord } from "./type";

export const MessageProvider = new Provider<IChatMessageRecord, (config: IChatMessageRecord) => IChatMessageRecord >();
