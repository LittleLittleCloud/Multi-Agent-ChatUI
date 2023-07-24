import { useEffect, useState } from "react";
import { IGPT35Turbo, ITextDavinci003 } from "./GPT";
import { TextField, Stack } from "@mui/material";
import { EditableSavableTextField, SettingSection, SmallNumberSetting, SmallTextSetting } from "@/components/Global/EditableSavableTextField";

export const ModelConfig = (model: IGPT35Turbo | ITextDavinci003, onModelConfigChanged : (config: IGPT35Turbo | ITextDavinci003) => void) => {
    return (
        <>
            <SmallTextSetting name="api key" value={model.apiKey} onChange={(value) => onModelConfigChanged({ ...model, apiKey: value})}/>
            <SmallNumberSetting name="max token" value={model.maxTokens} min={0} max={2048} step={1} onChange={(value) => onModelConfigChanged({ ...model, maxTokens: value})}/>
            <SmallNumberSetting name="temperature" value={model.temperature} min={0} max={1} step={0.01} onChange={(value) => onModelConfigChanged({ ...model, temperature: value})}/>
            <SmallNumberSetting name="top p" value={model.topP} min={0} max={1} step={0.01} onChange={(value) => onModelConfigChanged({ ...model, topP: value})}/>
            <SmallNumberSetting name="frequency penalty" value={model.frequencyPenalty} min={0} max={1} step={0.01} onChange={(value) => onModelConfigChanged({ ...model, frequencyPenalty: value})}/>
            <SmallNumberSetting name="presence penalty" value={model.presencePenalty} min={0} max={1} step={0.01} onChange={(value) => onModelConfigChanged({ ...model, presencePenalty: value})}/>
        </>);
};