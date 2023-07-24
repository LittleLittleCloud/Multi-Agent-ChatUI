import { useEffect, useState } from "react";
import { GPT_35_TURBO, IAzureTextEmbeddingAda002V2, IGPT35Turbo, ITextDavinci003, TextDavinci003 } from "./GPT";
import { TextField, Stack } from "@mui/material";
import { EditableSavableTextField, SettingSection, SmallNumberSetting, SmallTextSetting } from "@/components/Global/EditableSavableTextField";

const GPTConfig = (model: ITextDavinci003 | IGPT35Turbo, onModelConfigChanged: (model: ITextDavinci003 | IGPT35Turbo) => void) => {
    return (
        <>
            <SmallTextSetting name="api key" value={model.apiKey} onChange={(value) => onModelConfigChanged({ ...model, apiKey: value})}/>
            <SmallTextSetting name="deployment" value={model.deploymentID} onChange={(value) => onModelConfigChanged({ ...model, deploymentID: value})}/>
            <SmallTextSetting name="resource name" value={model.resourceName} onChange={(value) => onModelConfigChanged({ ...model, resourceName: value})}/>
            <SmallNumberSetting name="max token" value={model.maxTokens} min={0} max={2048} step={1} onChange={(value) => onModelConfigChanged({ ...model, maxTokens: value})}/>
            <SmallNumberSetting name="temperature" value={model.temperature} min={0} max={1} step={0.01} onChange={(value) => onModelConfigChanged({ ...model, temperature: value})}/>
            <SmallNumberSetting name="top p" value={model.topP} min={0} max={1} step={0.01} onChange={(value) => onModelConfigChanged({ ...model, topP: value})}/>
            <SmallNumberSetting name="frequency penalty" value={model.frequencyPenalty} min={0} max={1} step={0.01} onChange={(value) => onModelConfigChanged({ ...model, frequencyPenalty: value})}/>
            <SmallNumberSetting name="presence penalty" value={model.presencePenalty} min={0} max={1} step={0.01} onChange={(value) => onModelConfigChanged({ ...model, presencePenalty: value})}/>
        </>);
};

export const AzureEmbeddingConfig = (model: IAzureTextEmbeddingAda002V2, onModelConfigChanged: (model: IAzureTextEmbeddingAda002V2) => void) => {
    return (
        <>
            <SmallTextSetting name="api key" value={model.apiKey} onChange={(value) => onModelConfigChanged({ ...model, apiKey: value})}/>
            <SmallTextSetting name="deployment" value={model.deploymentName} onChange={(value) => onModelConfigChanged({ ...model, deploymentName: value})}/>
            <SmallTextSetting name="resource name" value={model.resourceName} onChange={(value) => onModelConfigChanged({ ...model, resourceName: value})}/>
        </>);
}

export {GPTConfig}