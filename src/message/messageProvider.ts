import { Provider } from "@/utils/app/provider";
import { IMessage } from "./type";

export const MessageProvider = new Provider<IMessage, (config: IMessage) => IMessage >();
