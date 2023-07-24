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

import { Box, Container, List, ListItem, Stack, Typography, Avatar, Button, ListItemButton, ListItemIcon, ListItemText, Divider, TextField, Tab, Tabs, DialogTitle, Dialog, DialogActions, DialogContent, DialogContentText, ListItemAvatar, IconButton, Menu, MenuItem } from '@mui/material';
import { CentralBox, EditableSavableTextField, EditableSelectField, LargeAvatar, SelectableListItem, SettingSection, SmallAvatar, SmallLabel, SmallSelectField, SmallSelectSetting, SmallTextField, SmallTextSetting, TinyAvatar } from '../Global/EditableSavableTextField';
import { TabContext, TabPanel } from '@mui/lab';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DeleteConfirmationDialog } from '../Global/DeleteConfirmationDialog';
import { StorageAction } from '@/utils/app/storageReducer';
import { ImageBlobStorage } from '@/utils/blobStorage';
import { AgentProvider } from '@/agent/agentProvider';
import { IAgent } from '@/agent/type';

const CreateAgentDialog = (props: {open: boolean, onClose: () => void, storageDispatcher: Dispatch<StorageAction>}) => {
    const [alias, setAlias] = useState("");
    const [agentID, setAgentID] = useState<string | null>(null);
    const availableAgents = AgentProvider.getAvailableModels();
    const [isSavable, setIsSavable] = useState(false);

    useEffect(() => {
        setIsSavable(alias != "" && agentID != null);
    }, [alias, agentID]);

    const onAgentCreatedHandler = (agent: IAgent) => {
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
                    onClick={() => onAgentCreatedHandler({...AgentProvider.getDefaultValue(agentID!), alias: alias})}>Create</Button>
            </DialogActions>
        </Dialog>
    );
}

export const AgentPage: FC<{availableAgents: IAgent[], storageDispatcher: Dispatch<StorageAction>}> = ({availableAgents, storageDispatcher}) => {
    const [selectedAgent, setSelectedAgent] = useState<IAgent>();
    const [tab, setTab] = useState("1");
    const [onOpenCreateAgentDialog, setOpenCreateAgentDialog] = useState(false);
    const [onOpenSettingMenu, setOpenSettingMenu] = useState(-1);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [agentToDelete, setAgentToDelete] = useState<IAgent | null>(null);
    const registeredAgents = AgentProvider.getAvailableModels();

    const handleClose = () => {
        setAnchorEl(null);
      };

    const AgentAdvancedSettingPanel = (props: { agent: IAgent, onchange: (agent: IAgent) => void}) => {
        if(!AgentProvider.hasProvider(props.agent.type)){
            return <Typography>Not implemented</Typography>
        }

        return AgentProvider.getConfigUIProvider(props.agent.type)(props.agent, props.onchange);
    }

    const onCloseSettingMenu = () => {
        setOpenSettingMenu(-1);
        setAnchorEl(null);
    }

    const onAgentDeletedHandler = (agent: IAgent) => {
        storageDispatcher({type: 'removeAgent', payload: agent});
        if(selectedAgent?.alias == agent.alias){
            setSelectedAgent(undefined);
        }
        setAgentToDelete(null);
        onCloseSettingMenu();
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
            storageDispatcher({type: 'updateAgent', payload: {...selectedAgent!, avatar: file.name}, original: selectedAgent});
            setSelectedAgent({...selectedAgent!, avatar: file.name});
        }

        reader.readAsArrayBuffer(file);
    };

    const onAgentUpdatedHandler = (agent: IAgent, original?: IAgent) => {
        storageDispatcher({type: 'updateAgent', payload: agent, original: original ?? selectedAgent});
        setSelectedAgent(agent);
    };

    const onAgentCloneHandler = (agent: IAgent) => {
        // deep copy
        var clonedAgent = JSON.parse(JSON.stringify(agent)) as IAgent;
        clonedAgent.alias = clonedAgent.alias + " (clone)";
        storageDispatcher({type: 'addAgent', payload: clonedAgent});
        onCloseSettingMenu();
    };

    return (
        <Box
            sx={{
                display: "flex",
                height: "100%",
                width: "100%",
                backgroundColor: "background.default",
                flexDirection: "row",
                overflow: "scroll",
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
                        onCloseSettingMenu();
                    }}
                />
                <Menu
                MenuListProps={{
                    'aria-labelledby': 'hover-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                >
                    <MenuItem onClick={(e) => onAgentCloneHandler(availableAgents[onOpenSettingMenu])}>Clone</MenuItem>
                    <MenuItem onClick={(e) => setAgentToDelete(availableAgents[onOpenSettingMenu])}>Delete</MenuItem>
                </Menu>
            <Box
                sx={{
                    width: "20%",
                    height: "100%",
                }}>
            <Box
                sx={{
                    width: "100%",
                    height: "90%",
                }}>
            <List>
                {availableAgents.map((agent, index) => 
                    <SelectableListItem
                        selected={selectedAgent?.alias == agent.alias}
                        key={index}
                        onClick={() => setSelectedAgent(availableAgents[index])}>
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{
                                width: "100%",
                            }}>
                            <Box
                                sx={{
                                    width: "40%",
                                    display: "flex",
                                }}>
                                <SmallAvatar
                                    avatarKey={agent.avatar} />
                            </Box>
                            <Box
                                sx={{
                                    width: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                }}>
                                <SmallLabel>{agent.alias}</SmallLabel>
                            </Box>
                            <CentralBox
                                sx={{
                                width: '10%'
                                }}>
                                <IconButton
                                    onClick={(e) =>
                                    {
                                        setOpenSettingMenu(index);
                                        setAnchorEl(e.currentTarget);
                                        e.stopPropagation();
                                    }}
                                    className='hover-button' >
                                    <MoreVertIcon />
                                </IconButton>
                            </CentralBox>
                        </Stack>
                    </SelectableListItem>
                )}
            </List>
            </Box>
            <CentralBox
                sx={{
                    width: "100%",
                    height: "10%",
                }}
            >
            <Button
                sx={{
                    width: "100%",
                    height: "100%",
                }}
                onClick={() => setOpenCreateAgentDialog(true)}>
                Add an agent
            </Button>
            </CentralBox>
            </Box>
            
            <Divider orientation="vertical" flexItem />
            {selectedAgent &&
                <Box sx = {{
                    width: "80%",
                    height: "100%",
                    overflow: "scroll",
                }}>
                    <TabContext value={tab}>
                    <Tabs
                        value={tab}
                        onChange={(e, v) =>setTab(v)}>
                        <Tab label="Basic info" value="1" />
                        <Tab label={`setting: ${selectedAgent.type}`} value="2" />
                    </Tabs>
                    <TabPanel value="1">
                        <Stack
                            direction="column"
                            spacing={4}
                            sx={{
                                height: "100%",
                                overflow: "scroll",
                            }}>
                        <SettingSection
                            toolTip="basic setting">
                            <Stack
                                direction="row"
                                sx={{
                                    width: "100%",
                                }} >
                                <Stack
                                    width="70%"
                                    direction="column"
                                    spacing={2}>
                                    <SmallTextSetting name="alias" toolTip='The name of the agent' value={selectedAgent.alias} onChange={(value) => onAgentUpdatedHandler({...selectedAgent, alias: value!}, selectedAgent)} />
                                    <SmallTextSetting name="description" toolTip='The description of the agent' value={selectedAgent.description} onChange={(value) => onAgentUpdatedHandler({...selectedAgent, description: value!}, selectedAgent)} />
                                    <SmallSelectSetting name='agent type' toolTip='the type of agent' options={registeredAgents} value={selectedAgent.type} onChange={(value) => onAgentUpdatedHandler({...selectedAgent, type: value!}, selectedAgent)}/>
                                </Stack>
                                <CentralBox
                                    sx ={{
                                        width: "30%",
                                        flexDirection: "column",
                                    }}>
                                    <LargeAvatar
                                        avatarKey={selectedAgent.avatar}/>
                                    <Button
                                        component='label'>
                                        upload
                                        <input
                                        accept="image/*"
                                        type="file"
                                        hidden
                                        onChange={(e) => onAvatarUploadedHandler(e)}/>
                                    </Button>
                                </CentralBox>
                            </Stack>
                            
                        </SettingSection>
                        </Stack>
                    </TabPanel>
                    <TabPanel value="2">
                        <Stack
                            direction="column"
                            spacing={4}
                            sx={{
                                height: "100%",
                                overflow: "scroll",
                            }}>
                        <AgentAdvancedSettingPanel agent={selectedAgent} onchange={(value) => onAgentUpdatedHandler(value, selectedAgent)}  />
                        </Stack>
                    </TabPanel>
                    <TabPanel value="3">
                        <Typography>Try it out</Typography>
                    </TabPanel>
                    </TabContext>
                </Box>
            }
            </>
            }

        </Box>
    )
}