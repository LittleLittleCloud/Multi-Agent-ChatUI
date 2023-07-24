import { SmallNumberSetting, SmallTextSetting } from "@/components/Global/EditableSavableTextField";
import { IChatMemory } from "./chatMemory";

export const ChatMemoryConfigPanel: React.FC<{chatMemoryConfig: IChatMemory, onChange: (chatMemoryConfig: IChatMemory) => void}> = (props) => {
    return (
        <>
            <SmallNumberSetting name="max history length" value={props.chatMemoryConfig.maxHistoryLength} min={0} max={1000} step={1} onChange={(value) => props.onChange({ ...props.chatMemoryConfig, maxHistoryLength: value})}/>
            <SmallTextSetting name="memory key" value={props.chatMemoryConfig.memoryKey} onChange={(value) => props.onChange({ ...props.chatMemoryConfig, memoryKey: value})}/>
        </>
    )
}