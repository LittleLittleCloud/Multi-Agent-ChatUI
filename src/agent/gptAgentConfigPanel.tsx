import { IGPTAgentRecord, IZeroshotAgentMessage } from './gptAgent';
import { CentralBox, EditableSavableTextField, EditableSelectField, SettingSection, SmallLabel, SmallMultipleSelectSetting, SmallSelectSetting, SmallTextSetting, SmallToggleSetting, TinyClickableLabel, TinyLabel, useEffectAsync } from '@/components/Global/EditableSavableTextField';
import { Box, Chip, Divider, Stack, Tab, Tabs } from '@mui/material';
import React from 'react';
import { Markdown } from "@/components/Global/Markdown";
import { EmbeddingProvider, LLMProvider } from "@/model/llmprovider";
import { IChatMessageRecord } from "@/message/type";
import { MemoryProvider } from '@/memory/memoryProvider';
import { IEmbeddingModel, IChatModelRecord, IModel } from '@/model/type';
import { IMemory } from '@/memory/type';
import { AzureGPT, IAzureGPTRecord } from "@/model/azure/GPT";
import { IOpenAIGPTRecord, OpenAIGPT } from "@/model/openai/GPT";

var globalTabIndex = 0;

export const GPTAgentConfigPanel = (agent : IGPTAgentRecord, onAgentConfigChanged: (config: IGPTAgentRecord) => void) => {
    const [selectedLLMModelID, setSelectedLLMModelID] = React.useState(agent.llm?.type);
    const [llm, setLLM] = React.useState(agent.llm);
    const [embedding, setEmbedding] = React.useState(agent.embedding);
    const [memory, setMemory] = React.useState(agent.memory);
    const [promptPreview, setPromptPreview] = React.useState<string>("");
    const [tabIndex, setTabIndex] = React.useState(globalTabIndex);
    const availableLLMModels = LLMProvider.getAvailableModels();
    const availableMemories = MemoryProvider.getAvailableModels();
    const availableEmbeddingModels = EmbeddingProvider.getAvailableModels();
    const LLMSettingPanel = (props: {model: IAzureGPTRecord | IOpenAIGPTRecord, onChange: (model: IAzureGPTRecord | IOpenAIGPTRecord) => void}) => {
        if(selectedLLMModelID != undefined && LLMProvider.hasProvider(selectedLLMModelID)){
            if (selectedLLMModelID == 'azure.gpt') {
                return LLMProvider.getConfigUIProvider(selectedLLMModelID)(props.model, (model) => props.onChange(model as IAzureGPTRecord));
            }

            if (selectedLLMModelID == 'openai.gpt') {
                return LLMProvider.getConfigUIProvider(selectedLLMModelID)(props.model, (model) => props.onChange(model as IOpenAIGPTRecord));
            }
        }
        return <></>;
    }

    const MemorySettingPanel = (props: {model: IMemory, onChange: (model: IMemory) => void}) => {
        if (memory != undefined && MemoryProvider.hasProvider(memory.type)) {
            return MemoryProvider.getConfigUIProvider(memory.type)(props.model, (model: IMemory) => props.onChange(model as IMemory));
        }
        return <></>;
    }

    const EmbeddingSettingPanel = (props: {model: IEmbeddingModel, onChange: (model: IEmbeddingModel) => void}) => {
        if (embedding != undefined && EmbeddingProvider.hasProvider(embedding.type)) {
            return EmbeddingProvider.getConfigUIProvider(embedding.type)(props.model, (model: IModel) => props.onChange(model as IEmbeddingModel));
        }
        return <></>;
    }

    const updateTabIndex = (index: number) => {
        globalTabIndex = index;
        setTabIndex(index);
    }

    React.useEffect(() => {
        // create default llm config
        if(selectedLLMModelID != agent.llm?.type && selectedLLMModelID != undefined){
            var newLLM: IChatModelRecord = LLMProvider.getDefaultValue(selectedLLMModelID);
            // check if llm is AzureGPT or OpenAIGPT
            if (newLLM instanceof AzureGPT || newLLM instanceof OpenAIGPT) {
                setLLM(newLLM);
                onAgentConfigChanged({...agent, llm: newLLM});
            }
            else
            {
                throw new Error("llm model not supported");
            }
        }
    }, [selectedLLMModelID]);

    useEffectAsync(async () => {
        var currentMessage: IChatMessageRecord = {
            type: "message",
            name: "user",
            role: "user",
            content: "hello world",
        };

        var history: IChatMessageRecord[] = [
            {
                type: "message",
                name: "agent",
                role: "assistant",
                content: "hello world",
            } as IChatMessageRecord,
        ];

        var prompt = agent.system_message;
        setPromptPreview(prompt);
    }, [agent]);

    function TabPanel(props: { children?: React.ReactNode; index: number; value: number;}) {
        const { children, value, index, ...other } = props;
      
        return (
          <Box
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
            sx={{
                flexGrow: 1,
            }}>
            {value === index && 
                children
            }
          </Box>
        );
      }
      
      function a11yProps(index: number) {
        return {
          id: `vertical-tab-${index}`,
          'aria-controls': `vertical-tabpanel-${index}`,
        };
      }

    return (
        <Box
            sx={{
                display: 'flex',
            }}>
            <Tabs
                orientation="vertical"
                value={tabIndex}
                sx={{
                    '.MuiTabs-indicator': {
                      left: 0,
                    },
                    '.MuiTab-root': {
                        alignItems: 'flex-start',
                    },
                  }}
                onChange={(event, newValue) => updateTabIndex(newValue)}>
                <Tab
                    label={<SmallLabel>llm</SmallLabel>}
                    {...a11yProps(0)} />
                {/* <Tab
                    label={<SmallLabel>prompt</SmallLabel>}
                    {...a11yProps(1)}/>
                <Tab
                    label={<SmallLabel>memory</SmallLabel>}
                    {...a11yProps(2)} />
                
                <Tab
                    label={<SmallLabel>embedding</SmallLabel>}
                    {...a11yProps(3)} /> */}
            </Tabs>
            <TabPanel value={tabIndex} index={0}>
                <SettingSection
                        title='llm setting'
                        toolTip='llm settings'>
                        <SmallSelectSetting name='selected llm model' options={availableLLMModels} value={selectedLLMModelID} onChange={(value) => {
                            if (value == 'azure.gpt' || value == 'openai.gpt') {
                                setSelectedLLMModelID(value);
                            } else {
                                throw new Error("llm model not supported");
                            }
                        }}/>
                        {selectedLLMModelID && llm != undefined &&
                            <LLMSettingPanel model={llm} onChange={(model) => onAgentConfigChanged({...agent, llm: model})}/>
                        }
                    </SettingSection>
            </TabPanel>
            {/* <TabPanel value={tabIndex} index={1}>
                <SettingSection
                    title='prompt setting'
                    toolTip='prompt settings'>
                    <SmallToggleSetting
                        name='markdown'
                        toolTip="add markdown prompt"
                        value={agent.useMarkdown}
                        onChange={(value) => onAgentConfigChanged({...agent, useMarkdown: value})}/>
                    <SmallToggleSetting
                        name='include name'
                        toolTip="include agent name in prompt"
                        value={agent.includeName}
                        onChange={(value) => onAgentConfigChanged({...agent, includeName: value})}/>
                    <SmallToggleSetting
                        name='include history'
                        toolTip="include history in prompt"
                        value={agent.includeHistory}
                        onChange={(value) => onAgentConfigChanged({...agent, includeHistory: value})}/>
                    <SmallTextSetting name='prefix prompt' value={agent.prefixPrompt} onChange={(value) => onAgentConfigChanged({...agent, prefixPrompt: value})}/>
                    <SmallTextSetting name='suffix prompt' value={agent.suffixPrompt} onChange={(value) => onAgentConfigChanged({...agent, suffixPrompt: value})}/>
                    <SmallTextSetting
                        name='prompt preview'
                        toolTip="prompt preview"
                        value={promptPreview} />
                </SettingSection>
            </TabPanel>
            <TabPanel value={tabIndex} index={2}>
                <SettingSection
                    title='memory setting'
                    toolTip='memory settings'>
                    <SmallSelectSetting name='selected memory model' options={availableMemories} value={memory?.type} onChange={(value) => setMemory(MemoryProvider.getDefaultValue(value))}/>
                    {memory != undefined &&
                        <MemorySettingPanel model = {memory} onChange={(model) => onAgentConfigChanged({...agent, memory: model})}/>
                    }
                </SettingSection>
            </TabPanel>
            <TabPanel value={tabIndex} index={3}>
                <SettingSection
                    title="embedding setting"
                    toolTip="embedding settings">
                    <SmallSelectSetting name='selected embedding model' options={availableEmbeddingModels} value={embedding?.type} onChange={(value) => setEmbedding(EmbeddingProvider.getDefaultValue(value))}/>
                    {embedding != undefined &&
                        <EmbeddingSettingPanel model = {embedding} onChange={(model) => onAgentConfigChanged({...agent, embedding: model})}/>
                    }
                </SettingSection>
            </TabPanel> */}
        </Box>
    )
};

export const MarkdownMessage = (message: IZeroshotAgentMessage, onChange: (message: IZeroshotAgentMessage) => void) => {
    const prompt = message.prompt ?? "no prompt";
    const content = message.content ?? "";
    const [openContent, setOpenContent] = React.useState<'markdown' | 'plain text' | 'prompt' | 'error'>("markdown");
    return (
        <Stack
            direction="column"
            spacing={1}>
            {openContent === 'markdown' &&
                <Markdown>{content}</Markdown>
            }
            {
                openContent === 'plain text' &&
                <SmallLabel>{content.replace('\n', '<br />')}</SmallLabel>
            }
            {openContent === 'prompt' &&
                <SmallLabel>{prompt}</SmallLabel>
            }
            <Stack
                direction="row"
                spacing={1}>
                {
                    <TinyClickableLabel
                    onClick={() => setOpenContent('markdown')}
                    sx = {{
                        color: openContent == 'markdown' ? 'primary.main' : 'text.secondary',
                    }}>content</TinyClickableLabel>
                }
                <Divider orientation="vertical" flexItem />
                <TinyClickableLabel
                    onClick={() => setOpenContent('plain text')}
                    sx = {{
                        color: openContent == 'plain text' ? 'primary.main' : 'text.secondary',
                    }}>plain text</TinyClickableLabel>
            </Stack>
        </Stack>
    )
}