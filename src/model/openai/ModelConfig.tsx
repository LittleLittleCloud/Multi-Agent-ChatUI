import { useEffect, useState } from "react";
import { IGPT, ITextDavinci003 } from "./GPT";
import { EditableSavableTextField, SettingSection, SmallNumberSetting, SmallSelectSetting, SmallTextSetting } from "@/components/Global/EditableSavableTextField";
import { AVAILABLE_GPT_MODELS, getGPTMaxTokenLimit } from "../utils";

export const ModelConfig = (model: IGPT, onModelConfigChanged : (config: IGPT) => void) => {
    const [maxToken, setMaxToken] = useState(model.maxTokens);

    useEffect(() => {
        var maxToken = getGPTMaxTokenLimit(model.model);
        setMaxToken(maxToken);
    }, [model]);

    return (
        <>
            <SmallTextSetting name="api key" value={model.apiKey} onChange={(value) => onModelConfigChanged({ ...model, apiKey: value})}/>
            <SmallSelectSetting name="model" value={model.model} options={AVAILABLE_GPT_MODELS} onChange={(value) => onModelConfigChanged({ ...model, model: value})}/>
            <SmallNumberSetting name="max token" value={model.maxTokens} min={0} max={maxToken} step={1} onChange={(value) => onModelConfigChanged({ ...model, maxTokens: value})}/>
            <SmallNumberSetting name="temperature" value={model.temperature} min={0} max={2} step={0.01} onChange={(value) => onModelConfigChanged({ ...model, temperature: value})}/>
            <SmallNumberSetting name="top p" value={model.topP} min={0} max={1} step={0.01} onChange={(value) => onModelConfigChanged({ ...model, topP: value})}/>
            <SmallNumberSetting name="frequency penalty" value={model.frequencyPenalty} min={0} max={1} step={0.01} onChange={(value) => onModelConfigChanged({ ...model, frequencyPenalty: value})}/>
            <SmallNumberSetting name="presence penalty" value={model.presencePenalty} min={0} max={1} step={0.01} onChange={(value) => onModelConfigChanged({ ...model, presencePenalty: value})}/>
        </>);
};