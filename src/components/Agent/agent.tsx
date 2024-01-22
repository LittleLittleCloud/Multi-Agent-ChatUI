import {
    Dispatch,
    FC,
    memo,
    MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
  } from 'react';

import { Box, Container, List, ListItem, Stack, Typography, Avatar, Button, ListItemButton, ListItemIcon, ListItemText, Divider, TextField, Tab, Tabs, DialogTitle, Dialog, DialogActions, DialogContent, DialogContentText, ListItemAvatar, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { CentralBox, EditableSavableTextField, EditableSelectField, LargeAvatar, LargeLabel, SelectableListItem, SettingSection, SmallAvatar, SmallLabel, SmallSelectField, SmallSelectSetting, SmallTextField, SmallTextSetting, TinyAvatar } from '../Global/EditableSavableTextField';
import { TabContext, TabPanel } from '@mui/lab';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DeleteConfirmationDialog } from '../Global/DeleteConfirmationDialog';
import { StorageAction } from '@/utils/app/storageReducer';
import { ImageBlobStorage } from '@/utils/blobStorage';
import { AgentProvider } from '@/agent/agentProvider';
import { IAgentRecord } from '@/agent/type';

import { AgentListItem } from './agentListItem';

const CreateAgentDialog = (props: {open: boolean, onClose: () => void, storageDispatcher: Dispatch<StorageAction>}) => {
    const [alias, setAlias] = useState("");
    const [agentID, setAgentID] = useState<string | null>(null);
    const availableAgents = AgentProvider.getAvailableModels();
    const [isSavable, setIsSavable] = useState(false);

    useEffect(() => {
        setIsSavable(alias != "" && agentID != null);
    }, [alias, agentID]);

    const onAgentCreatedHandler = (agent: IAgentRecord) => {
        try{
            props.storageDispatcher({type: 'addAgent', payload: agent});
            props.onClose();
        }
        catch(err){
            alert(err);
            return;
        }
    };

    return (
        <Dialog open={props.open} onClose={props.onClose}>
            <DialogTitle>Create Agent</DialogTitle>
            <DialogContent>
                <Stack
                    direction="column"
                    spacing={1}
                    sx={{
                        mt: 2,
                    }}>
                    <SmallTextField
                        value={alias}
                        label="Agent Alias"
                        onChange={(e) => setAlias(e.target.value)}
                        fullWidth
                    />
                    <SmallSelectField
                        value={agentID!}
                        name="Agent type"
                        options={availableAgents}
                        onChange={(value) => setAgentID(value!)}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button
                    disabled={!isSavable}
                    onClick={() => onAgentCreatedHandler({...AgentProvider.getDefaultValue(agentID!), name: alias})}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}

export const AgentPage: FC<{availableAgents: IAgentRecord[], storageDispatcher: Dispatch<StorageAction>}> = ({availableAgents, storageDispatcher}) => {
    const [selectedAgent, setSelectedAgent] = useState<IAgentRecord | undefined>(() => availableAgents[0] ?? undefined);
    const [onOpenCreateAgentDialog, setOpenCreateAgentDialog] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState<IAgentRecord | null>(null);
    const availableTabs: ('agent info' | 'settings')[] = ['agent info', 'settings']
    const [selectedTab, setSelectedTab] = useState<'agent info'|'settings'>(availableTabs[0]);
    const [agentName, setAgentName] = useState(selectedAgent?.name ?? '');
    const [agentDescription, setAgentDescription] = useState(selectedAgent?.system_message ?? '');
    const [agentAvatar, setAgentAvatar] = useState(selectedAgent?.avatar ?? '');
    const [agentType, setAgentType] = useState(selectedAgent?.type ?? '');
    const availableAgentType = AgentProvider.getAvailableModels();
    const AgentAdvancedSettingPanel = (props: { agent: IAgentRecord, onchange: (agent: IAgentRecord) => void}) => {
        if(!AgentProvider.hasProvider(props.agent.type)){
            return <Typography>Not implemented</Typography>
        }

        return AgentProvider.getConfigUIProvider(props.agent.type)(props.agent, props.onchange);
    }

    const onAgentDeletedHandler = (agent: IAgentRecord) => {
        storageDispatcher({type: 'removeAgent', payload: agent});
        if(selectedAgent?.name == agent.name){
            setSelectedAgent(undefined);
        }
        setAgentToDelete(null);
    };

    const onAvatarUploadedHandler = ({ target }: {target: HTMLInputElement}) => {
        console.log("upload avatar");
        // read file
        // set avatar
        if(target.files == null || target.files.length == 0){
            return;
        }

        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = e.target?.result;
            var blob = new Blob([data!]);
            var blobStorage = await ImageBlobStorage;
            await blobStorage.saveBlob(blob, file.name);
            setAgentAvatar(file.name);
        }

        reader.readAsArrayBuffer(file);
    };

    const onSelectedAgentChangedHandler = (agent: IAgentRecord) => {
        setSelectedAgent((prop) => {
            console.log(prop);
            if(prop?.name == agent.name){
                return agent;
            }

            setAgentName(agent.name);
            setAgentDescription(agent.system_message);
            setAgentAvatar(agent.avatar);

            return agent;
        })
    }

    const onSaveAgentInfoHandler = () => {
        // validation
        if (agentName == undefined || agentName == '') {
            alert('Agent name is required');
            return;
        }

        // verify if agent name is unique
        if (availableAgents.filter((agent) => agent.name == agentName).length > 0 && agentName != selectedAgent?.name) {
            alert('Agent name must be unique');
            return;
        }

        if (agentDescription == undefined || agentDescription == '') {
            alert('Agent description is required');
            return;
        }

        if (agentType == undefined || agentType == '') {
            alert('Agent type is required');
            return;
        }

        storageDispatcher({type: 'updateAgent', payload: {...selectedAgent!, name: agentName, system_message: agentDescription, avatar: agentAvatar, type: agentType}, original: selectedAgent});
        onSelectedAgentChangedHandler({...selectedAgent!, name: agentName, system_message: agentDescription, avatar: agentAvatar, type: agentType});

        alert('Agent info saved');
    }

    const onCancelAgentInfoChangeHandler = () => {
        setAgentName(selectedAgent?.name ?? '');
        setAgentDescription(selectedAgent?.system_message ?? '');
        setAgentAvatar(selectedAgent?.avatar ?? '');
        setAgentType(selectedAgent?.type ?? '');
    }

    const onAgentUpdatedHandler = (agent: IAgentRecord, original?: IAgentRecord) => {
        storageDispatcher({type: 'updateAgent', payload: agent, original: original ?? selectedAgent});
        console.log(agent);
        onSelectedAgentChangedHandler(agent);
    };

    const onAgentCloneHandler = (agent: IAgentRecord) => {
        // deep copy
        var clonedAgent = JSON.parse(JSON.stringify(agent)) as IAgentRecord;
        clonedAgent.name = clonedAgent.name + " (clone)";
        storageDispatcher({type: 'addAgent', payload: clonedAgent});
    };

    return (
        <Box
            sx={{
                display: "flex",
                height: "100%",
                width: "100%",
                backgroundColor: "background.default",
                flexDirection: "row",
            }}>
            <CreateAgentDialog
                storageDispatcher={storageDispatcher}
                open={onOpenCreateAgentDialog}
                onClose={() => setOpenCreateAgentDialog(false)} />
                    
            {availableAgents?.length == 0 &&
            <CentralBox
                sx={{
                    width: "100%",
                    height: "100%",
                }}>
                <Button
                    onClick={() => setOpenCreateAgentDialog(true)}
                    sx={{
                        border: "3px dashed",
                        borderColor: "text.disabled",
                        '&.MuiButton-text':{
                          color: "text.disabled",
                        },
                        '&:hover': {
                          border: "3px dashed",
                        },
                  }}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Create an agent</Typography>
                </Button>
            </CentralBox>}
            {availableAgents?.length > 0 &&
            <>
                <DeleteConfirmationDialog
                    open={agentToDelete != null}
                    message='Are you sure you want to delete this agent?'
                    onConfirm={() => onAgentDeletedHandler(agentToDelete!)}
                    onCancel={() => {
                        setAgentToDelete(null);
                    }}/>
            <div
              className="flex h-full w-1/5 flex-col justify-between items-center">
            <div
                className='overflow-y-auto w-full grow'>
                {availableAgents.map((agent, index) => 
                    <AgentListItem
                        key={index}
                        agent={agent}
                        selected={selectedAgent?.name == agent.name}
                        onClick={() => onSelectedAgentChangedHandler(agent)}
                        onDeleted={(agent) => setAgentToDelete(agent)}
                        onCloned={(agent) => onAgentCloneHandler(agent)}
                        />
                )}
            </div>
            <Button
                onClick={() => setOpenCreateAgentDialog(true)}>
                Add an agent
            </Button>
            </div>
            
            <Divider orientation="vertical" flexItem />

            {selectedAgent &&
                <div
                    className='flex flex-col h-full grow p-2'>
                    <div
                        className='border-b border-gray-200 dark:border-gray-700'>
                        <ul
                            className='flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400'>
                            {availableTabs.map((tab) => 
                                <li
                                    key={tab}
                                    className={`px-4 py-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 text-font-apple-system ${selectedTab == tab ? 'border-b-2 border-blue-500 dark:border-blue-400 text-gray-900 dark:text-gray-200' : ''}`}
                                    onClick={() => setSelectedTab(tab)}>
                                    {tab}
                                </li>
                            )}
                        </ul>
                    </div>
                    <div
                        className='flex-grow py-2 overflow-y-auto'>
                        {selectedTab == 'agent info' &&
                        <div
                            className='flex flex-col space-x-5'>
                        <div
                            className='flex grow p-2 space-x-5'>
                            <div
                                className='flex flex-col grow p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800'>
                                <SmallLabel>Agent Avatar</SmallLabel>
                                <div className='flex items-center space-x-5 mt-2 mb-5'>
                                    <SmallAvatar
                                        avatarKey={agentAvatar}/>
                                    <label className="block">
                                        <span className="sr-only">Choose profile photo</span>
                                        <input
                                            type="file"
                                            accept='image/*'
                                            className="block w-full text-sm text-slate-500
                                          file:mr-4 file:py-1 file:px-2
                                          file:rounded-full file:border-0
                                          file:text-xs file:font-semibold
                                          file:bg-violet-50 file:text-violet-700 dark:file:text-violet-900 dark:file:bg-violet-400
                                          hover:file:bg-violet-100 dark:hover:file:bg-violet-300"
                                            onChange={onAvatarUploadedHandler}/>
                                    </label>
                                </div>
                                <SmallLabel>Agent Name</SmallLabel>
                                <div className="flex rounded-md shadow-sm ring-1 ring-inset focus-within:ring-2 sm:max-w-md mt-2 mb-5">
                                  <input
                                    className="flex-1 border-0 bg-transparent py-1 pl-2 text-slate-900 dark:text-slate-100 focus:ring-0 focus-within:ring-0 sm:text-sm sm:leading-6" 
                                    type="text"
                                    value={agentName} 
                                    onChange={(e) => setAgentName((e.target as HTMLInputElement).value)} />
                                </div>

                                <SmallLabel>Agent Description</SmallLabel>
                                <div className="flex rounded-md shadow-sm ring-1 ring-inset focus-within:ring-2 sm:max-w-md mt-2 mb-5">
                                  <textarea
                                    wrap='hard'
                                    rows={3}
                                    className="flex-1 border-0 bg-transparent py-1 pl-2 text-slate-900 dark:text-slate-100 focus:ring-0 focus-within:ring-0 sm:text-sm sm:leading-6" 
                                    value={agentDescription}
                                    onChange={(e) => setAgentDescription((e.target as HTMLTextAreaElement).value)} />
                                </div>

                                <SmallLabel>Agent Type</SmallLabel>
                                <div className='flex mt-2 space-x-5'>
                                {availableAgentType.map((agentType, index) =>(
                                    <div
                                        key={index}
                                        className='flex items-center space-x-2'>
                                        <input
                                            id={agentType}
                                            name="agent"
                                            type="checkbox"
                                            className="focus:ring-0 h-4 w-4 text-neutral-900 border-yellow"
                                            checked={agentType == agentType}
                                            onChange={() => setAgentType(agentType)}
                                        />
                                        <SmallLabel>{agentType}</SmallLabel>
                                    </div>
                                ))}
                                </div>
                            </div>
                        </div>
                        <div
                            className="px-4 py-3 sm:px-6 flex justify-end sm:flex sm:flex-row">
                            <Tooltip
                                title="Save agent info">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border-0 border-transparent shadow-sm px-4 py-2 bg-neutral-500 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-500 text-base font-medium text-white hover:bg-neutral-800 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={onSaveAgentInfoHandler}>
                              Save
                            </button>
                            </Tooltip>
                            <Tooltip
                                title="Cancel agent info change">
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border-0 shadow-sm px-4 py-2 bg-red-500 dark:bg-red-700  hover:bg-red-400 dark:hover:bg-red-500 text-base font-medium text-neutral-900 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={onCancelAgentInfoChangeHandler}>
                              Cancel
                            </button>
                            </Tooltip>
                          </div>
                        </div>
                        }
                        {selectedTab == 'settings' &&
                            <AgentAdvancedSettingPanel agent={selectedAgent} onchange={(value) => onAgentUpdatedHandler(value, selectedAgent)}  />
                        }
                    </div>
                </div>
            }
            </>
            }

        </Box>
    )
}