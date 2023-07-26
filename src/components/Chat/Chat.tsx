import { KeyValuePair } from '@/types/data';
import { ErrorMessage } from '@/types/error';
import { OpenAIModel } from '@/types/openai';
import { Prompt } from '@/types/prompt';
import { throttle } from '@/utils';
import { IconClearAll, IconKey, IconSettings } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import {
  Dispatch,
  FC,
  memo,
  MutableRefObject,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { renderToStaticMarkup } from "react-dom/server"
import { Spinner, ThreeDotBouncingLoader } from '../Global/Spinner';
import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { ChatMessage } from './ChatMessage';
import { ErrorMessageDiv } from './ErrorMessageDiv';
import { ModelSelect } from './ModelSelect';
import { SystemPrompt } from './SystemPrompt';
import { Alert, Avatar, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Menu, MenuItem, Paper, Stack, Typography, AvatarGroup, Fab, Tooltip, Modal, ThemeProvider, createTheme, Grid } from '@mui/material';
import { AgentExecutor } from 'langchain/agents';
import { IRecord } from '@/types/storage';
import { CentralBox, EditableSavableTextField, EditableSelectField, LargeLabel, SelectableListItem, SmallAvatar, SmallLabel, SmallMultipleSelectField, SmallSelectField, SmallTextButton, SmallTextField, TinyAvatar } from '../Global/EditableSavableTextField';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { DeleteConfirmationDialog } from '../Global/DeleteConfirmationDialog';
import { GroupAction, GroupCmd, groupReducer } from '@/utils/app/groupReducer';
import { IGroup } from '@/types/group';
import { Console, groupEnd } from 'console';
import { StorageAction } from '@/utils/app/storageReducer';
import { IAgent, IAgentExecutor } from '@/agent/type';
import { AgentProvider } from '@/agent/agentProvider';
import { IMessage, IsUserMessage } from '@/message/type';
import { MultiAgentGroup } from '@/chat/group';
import { Logger } from '@/utils/logger';
import { Conversation } from './Conversation';
import html2canvas from 'html2canvas';
import { VariableModal } from './VariableModal';

const CreateOrEditGroupDialog: FC<{open: boolean, group?: IGroup, agents: IAgent[], onSaved: (group: IGroup) => void, onCancel: () => void}> = ({open, group, agents, onSaved, onCancel}) => {
  const [groupName, setGroupName] = useState(group?.name);
  const [selectAgents, setSelectAgents] = useState(group?.agents ?? []); // [agentId]
  const [savable, setSavable] = useState<boolean>(false); // [agentId]

  useEffect(() => {
    setGroupName(group?.name);
    setSelectAgents(group?.agents ?? []);
  }, [group]);

  const onSavedHandler = () => {
    if(group){
      onSaved({...group, name: groupName!, agents: selectAgents!});
    }
    else{
      onSaved({name: groupName!, agents: selectAgents!, type: 'group', conversation: []} as IGroup);
    }
  };

  useEffect(() => {
    setSavable(groupName != undefined && groupName.length > 0 && selectAgents.length > 0);
  }, [groupName, selectAgents]);

  return (
    <Dialog open={open} onClose={onCancel}>
      {group && <DialogTitle>{`Edit ${group.name}`}</DialogTitle>}
      {!group && <DialogTitle>Create a new Group</DialogTitle>}
      <DialogContent>
        <Stack
          sx={{ mt:2 }}
          spacing={2}
          direction="column">
          <SmallTextField label="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          <SmallMultipleSelectField name="Agents" value={selectAgents} onChange={setSelectAgents} options={agents.map(a => a.alias)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button disabled = {!savable} onClick={onSavedHandler}>Save</Button>
      </DialogActions>
    </Dialog>);
};

const GroupPanel: FC<{groups: IGroup[], agents: IAgent[], onGroupSelected: (group?: IGroup) => void, storageDispatcher: Dispatch<StorageAction>}> = ({groups, agents, onGroupSelected, storageDispatcher}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [groupToDelete, setGroupToDelete] = useState<IGroup | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<IGroup>();
  const [openUpdateGroupDialog, setOpenUpdateGroupDialog] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<IGroup | undefined>(undefined);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGroupSelected = (group?: IGroup) => {
    setSelectedGroup(group);
    onGroupSelected(group);
  }
  
  const onClickDeleteGroup = (group: IGroup) => {
    handleClose();
    console.log('delete group', group);
    setGroupToDelete(group);
  }

  const onClickEditGroup = (group: IGroup) => {
    handleClose();
    setGroupToEdit(group);
    setOpenUpdateGroupDialog(true);
  }

  const onConfirmDeleteGroup = () => {
    storageDispatcher({type: 'removeGroup', payload: groupToDelete!});
    if(selectedGroup?.name == groupToDelete?.name){
      handleGroupSelected(undefined);
    }
    setGroupToDelete(null);
  }

  const onEditGroupHandler = (group: IGroup) => {
    handleClose();
    setOpenUpdateGroupDialog(false);
    storageDispatcher({type: 'updateGroup', payload: group, original: groupToEdit!});

    if(selectedGroup?.name == group.name){
      handleGroupSelected(group);
    }
  }

  const onCancelDeleteGroup = () => {
    setGroupToDelete(null);
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
      }}>
    <DeleteConfirmationDialog
      open={groupToDelete != null}
      message="Are you sure to delete this group?"
      onConfirm={onConfirmDeleteGroup}
      onCancel={onCancelDeleteGroup} />
    <CreateOrEditGroupDialog
      open={openUpdateGroupDialog && groupToEdit != undefined}
      group={groupToEdit}
      agents={agents}
      onCancel={() => setOpenUpdateGroupDialog(false)}
      onSaved={onEditGroupHandler} />
        
    <Menu
      variant='menu'
      MenuListProps={{
        'aria-labelledby': `hidden-button`,
      }}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      >
      <MenuItem onClick={() => onClickEditGroup(groupToEdit!)}>{`Edit ${groupToEdit?.name}`}</MenuItem>
      <MenuItem onClick={() => onClickDeleteGroup(groupToEdit!)}>Delete</MenuItem>
    </Menu>
    <List>
      {groups.map((group, index) => (
        <SelectableListItem
          selected={selectedGroup?.name == group.name}
          key={index}
          onClick={() => handleGroupSelected(group)}>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              direction: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              overflow: 'scroll'
            }}>
              <AvatarGroup
                spacing="small"
                max={0}
                total = {group.agents.length}>
                {group.agents.map((agentId, index) => (
                  <TinyAvatar key={index} avatarKey={agents[index].avatar} />
                ))}
                </AvatarGroup>
            
            <Box
              sx={{
                width: '60%',
                justifyContent: 'space-between',
                display: 'flex',
                alignItems: 'center',
              }}>
              <SmallLabel textOverflow="clip">{group.name}</SmallLabel>
            <IconButton
                onClick={(e) =>
                {
                    setGroupToEdit(group)
                    handleClick(e)
                }}
                className='hover-button' >
                <MoreVertIcon />
            </IconButton>
            </Box>
          </Box>
        </SelectableListItem>
      ))}
    </List>
    </Box>
  )
}

export const Chat: FC<{groups: IGroup[], agents: IAgent[], storageDispatcher: Dispatch<StorageAction>}> =
  ({
    groups,
    agents,
    storageDispatcher,
  }) => {
    const { t } = useTranslation('chat');
    const [currentGroup, setCurrentGroup] = useState<IGroup>();
    const [currentConversation, setCurrentConversation] = useState<IMessage[]>();
    const [newMessage, setNewMessage] = useState<IMessage>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // const [availableGroups, setAvailableGroups] = useState<IGroup[]>(groups);
    const [openCreateGroupDialog, setOpenCreateGroupDialog] = useState<boolean>(false);
    const [respondingAgentAlias, setRespondingAgentAlias] = useState<string|undefined>(undefined);
    const [conversationOverflowY, setConversationOverflowY] = useState<"visible" | "scroll">("scroll");
    const chatRef = useRef(null);
    useEffect(() => {
      setCurrentConversation(currentGroup?.conversation);
    }, [currentGroup]);

    useEffect(() => {
      if(newMessage){
        var newConversation = [...currentConversation!, newMessage];
        setCurrentConversation(newConversation);
      }
    }, [newMessage]);

    useEffect(() => {
      storageDispatcher({type: 'updateGroup', payload: {...currentGroup!, conversation: currentConversation}})
    }, [currentConversation]);

    const newMessageHandler = async (message: IMessage, converstion: IMessage[], round: number = 5) => {
      setNewMessage(message);
      var currentAgents = agents.filter(agent => currentGroup?.agents.includes(agent.alias));
      var user: IAgent = {
        alias: 'Human',
        avatar: 'You',
        description: 'a user that seeks help from agents',
        type: 'agent',
      };
      var chat = new MultiAgentGroup(user, currentAgents, [...converstion, message]);
      for(var i = 0; i < round; i++){
        var rolePlay = await chat.selectNextRoleWithRandomVote();
        if (rolePlay.alias == chat.user.alias || rolePlay.alias == chat.system.alias){
          return;
        }
        try{
          setRespondingAgentAlias(rolePlay.alias);
          var agentExecutor = AgentProvider.getProvider(rolePlay)(rolePlay);
          var response = await agentExecutor.rolePlay(chat.conversation, currentAgents);
          chat.pushMessage(response);
          setNewMessage(response);
          setRespondingAgentAlias(undefined);
        }
        catch(e){
          setRespondingAgentAlias(undefined);
        }
      }
    }

    const onHandleCreateGroup = (group: IGroup) => {
      // first check if the group already exists
      try{
        storageDispatcher({type: 'addGroup', payload: group});
      }
      catch(e){
        alert(e);
        return;
      }

      setOpenCreateGroupDialog(false);
    }

    const onHandleSelectGroup = (group?: IGroup) => {
      if(group == undefined){
        setCurrentGroup(undefined);
        setCurrentConversation(undefined);

        return;
      }
      group.agents = group.agents.filter(agent => agents.find(a => a.alias === agent));
      setCurrentGroup(group);
      setCurrentConversation(group.conversation);
    };

    const onHandleScreenshot = () => {

      if(chatRef.current){
        // from top to down
        window.scrollTo(0, 0);
        setConversationOverflowY("visible");
        html2canvas(chatRef.current, {
          scrollY: -window.scrollY,
        }).then(canvas => {
          const link = document.createElement('a');
          link.download = 'screenshot.png';
          link.href = canvas.toDataURL();
          link.click();
          setConversationOverflowY("scroll");
        }
        );
      }
    }

    const onDeleteMessage = (message: IMessage, index: number) => {
      currentConversation!.splice(index, 1);
      setCurrentConversation(currentConversation!);
      storageDispatcher({type: 'updateGroup', payload: {...currentGroup!, conversation: currentConversation!}})
    }

    const onResendMessage = async (message: IMessage, index: number) => {
      var resendMessage = currentConversation![index];
      currentConversation!.splice(index, 1);
      setCurrentConversation(currentConversation!);
      storageDispatcher({type: 'updateGroup', payload: {...currentGroup!, conversation: currentConversation!}})
      await newMessageHandler(resendMessage, currentConversation!);
    }

    if (currentConversation == undefined && groups?.length == 0){
      return (
        <CentralBox
              sx={{
                width: "100%",
                height: "100%",
              }}>
                {agents?.length == 0 &&
                <LargeLabel>No agent available, create agent first please</LargeLabel>
                }
                {agents && agents.length > 0 &&
                <>
                <Button
                  onClick={() => setOpenCreateGroupDialog(true)}
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
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Create a group</Typography>
                </Button>
                
                </>
                }
            </CentralBox>
      )
    }
    return (
      <Grid
        container
        sx={{
          height: "100%",
          width: "100%",
          backgroundColor: "background.default",
        }}>
        {groups?.length > 0 &&
          <Grid
            item
            xs={2.5}
            sx={{
              height: "100%",
              flexDirection: "column",
              display: "flex",
              borderRight: "1px solid",
              borderColor: "divider",
            }}>
            <Box
              sx={{
                flexGrow: 1,
              }}>
              <GroupPanel
                groups={groups}
                agents={agents}
                onGroupSelected={onHandleSelectGroup}
                storageDispatcher={storageDispatcher}/>
            </Box>
            <CentralBox>
              <Button onClick={() => setOpenCreateGroupDialog(true)}>Create Group</Button>
            </CentralBox>
          </Grid>}
        <Grid
          item
          xs={9.5}
          height={1}
          sx={{
            flexDirection: "column",
            maxHeight: "100%",
            display: "flex",
          }}>
          {currentConversation &&
            <Box
              ref={chatRef}
              sx={{
                margin:2,
                flexGrow: 1,
                backgroundColor: "background.default",
                overflowY: conversationOverflowY,
              }}>
                <Conversation
                  conversation={currentConversation}
                  agents={agents}
                  onResendMessage={onResendMessage}
                  onDeleteMessage={onDeleteMessage} />
                
            </Box>}
              {/* <Fab
                sx={{
                  position: "absolute",
                  bottom: 128,
                  right: 32,
                }}>
                <Tooltip
                  title="take screenshot">
                <IconButton
                 onClick={onHandleScreenshot}>
                  <CropFreeIcon/>
                </IconButton>
                </Tooltip>
              </Fab> */}

          {currentGroup &&
            <Box
              sx={{
                margin:2,
              }}>
              {respondingAgentAlias &&
                <Stack
                  spacing={1}
                  direction="row"
                  sx={{
                    height: "5%",
                  }}>
                  <SmallLabel
                    color='text.secondary'
                    sx = {{
                      fontStyle: "italic",
                    }}>
                    {`${respondingAgentAlias} is typing`}
                  </SmallLabel>
                  <ThreeDotBouncingLoader/>
                </Stack>}
              <ChatInput
                textareaRef={textareaRef}
                messageIsStreaming={false}
                onSend={async (message) => {
                  await newMessageHandler(message, currentConversation!);
                }} />
            </Box>}

          {currentGroup && currentGroup.agents.length == 0 && 
          <CentralBox
            sx={{
              width: "100%",
              height: "100%",
            }}>
              <Typography variant="h4">{`No agent available in ${currentGroup.name}, add agent first`}</Typography>
          </CentralBox>
            }
        </Grid>
        <CreateOrEditGroupDialog
                  open={openCreateGroupDialog}
                  agents={agents}
                  onCancel={() => setOpenCreateGroupDialog(false)}
                  onSaved={onHandleCreateGroup} />
      </Grid>
    );
  };
Chat.displayName = 'Chat';