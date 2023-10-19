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
import { Alert, Avatar, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Menu, MenuItem, Paper, Stack, Typography, AvatarGroup, Fab, Tooltip, Modal, ThemeProvider, createTheme, Grid } from '@mui/material';
import { CentralBox, EditableSavableTextField, EditableSelectField, LargeLabel, SelectableListItem, SmallAvatar, SmallLabel, SmallMultipleSelectField, SmallSelectField, SmallTextButton, SmallTextField, TinyAvatar, TinyLabel } from '../Global/EditableSavableTextField';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { DeleteConfirmationDialog } from '../Global/DeleteConfirmationDialog';
import { GroupAction, GroupCmd, groupReducer } from '@/utils/app/groupReducer';
import { Console, groupEnd } from 'console';
import { StorageAction } from '@/utils/app/storageReducer';
import { IAgentRecord, IAgent } from '@/agent/type';
import { AgentProvider } from '@/agent/agentProvider';
import { IChatMessageRecord, IMessageRecord, IsChatMessage, IsUserMessage } from '@/message/type';
import { GroupChat } from '@/chat/group';
import { Logger } from '@/utils/logger';
import { Conversation } from './Conversation';
import html2canvas from 'html2canvas';
import { UserProxyAgent } from '@/agent/userProxyAgent';
import { GPTAgent } from '@/agent/gptAgent';
import { LLMProvider } from '@/model/llmprovider';
import { IGroupRecord } from '@/chat/type';
import { GroupConfigModal } from '@/chat/groupConfigModal';
import { ILogMessageRecord, LogMessageTypeString } from '@/message/LogMessage';

const GroupPanel: FC<{
  groups: IGroupRecord[],
  agents: IAgentRecord[],
  onGroupSelected: (group?: IGroupRecord) => void,
  storageDispatcher: Dispatch<StorageAction>,
  onUpdateGroup: (group: IGroupRecord, originalGroup?: IGroupRecord) => void,
}> = ({
  groups,
  agents,
  onGroupSelected,
  storageDispatcher,
  onUpdateGroup}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [groupToDelete, setGroupToDelete] = useState<IGroupRecord | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<IGroupRecord>();
  const [openUpdateGroupDialog, setOpenUpdateGroupDialog] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<IGroupRecord | undefined>(undefined);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGroupSelected = (group?: IGroupRecord) => {
    setSelectedGroup(group);
    onGroupSelected(group);
  }
  
  const onClickDeleteGroup = (group: IGroupRecord) => {
    handleClose();
    console.log('delete group', group);
    setGroupToDelete(group);
  }

  const onClickEditGroup = (group: IGroupRecord) => {
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

  const onEditGroupHandler = (group: IGroupRecord) => {
    handleClose();
    setOpenUpdateGroupDialog(false);
    onUpdateGroup(group, groupToEdit);
    // storageDispatcher({type: 'updateGroup', payload: group, original: groupToEdit!});

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
    <GroupConfigModal
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
                total = {group.agentNames.length}>
                {group.agentNames.map((agentId, index) => (
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

export const Chat: FC<{groupRecords: IGroupRecord[], agentRecords: IAgentRecord[], storageDispatcher: Dispatch<StorageAction>}> =
  ({
    groupRecords,
    agentRecords,
    storageDispatcher,
  }) => {
    const { t } = useTranslation('chat');
    const [currentGroup, setCurrentGroup] = useState<IGroupRecord>();
    const [currentConversation, setCurrentConversation] = useState<IMessageRecord[]>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // const [availableGroups, setAvailableGroups] = useState<IGroup[]>(groups);
    const [openCreateGroupDialog, setOpenCreateGroupDialog] = useState<boolean>(false);
    const [conversationOverflowY, setConversationOverflowY] = useState<"visible" | "scroll">("scroll");
    const chatRef = useRef(null);
    const [selectSpeakerResolver, setSelectSpeakerResolver] = useState<{availableAgents?: IAgent[], prompt?: string, resolvedAgent?: (agent?: IAgent) => void}>({});
    useEffect(() => {
      setCurrentConversation(currentGroup?.conversation);
    }, [currentGroup]);

    const addNewMessageToConversationHandler = async (message: IMessageRecord) => {
      setCurrentConversation(prev => [...prev ?? [], message]);
    }

    const Debug = (message: string, details?: any) => {
      addNewMessageToConversationHandler({
        type: LogMessageTypeString,
        level: 'debug',
        content: message,
        details: details,
      } as ILogMessageRecord);
      Logger.debug(message);
      if (details) {
        Logger.debug(details);
      }
    }

    const reselectSpeakerHandler = async (agents: IAgent[], prompt?: string) => {
      setSelectSpeakerResolver(prev => {
        return {}
      })

      const promiseSomething = new Promise<IAgent|undefined>((resolve) => {
        setSelectSpeakerResolver(_ => {
          return {
            resolvedAgent: resolve,
            availableAgents: agents,
            prompt: prompt,
          }
        })
      });

      var selectedAgent = await promiseSomething;
      return selectedAgent;
    }

    useEffect(() => {
      storageDispatcher({type: 'updateGroup', payload: {...currentGroup!, conversation: currentConversation ?? []}})
    }, [currentConversation]);

    const startGroupChatHandler = async (converstion: IChatMessageRecord[], round: number = 20) => {
      if(currentGroup == undefined){
        return;
      }
      Logger.log('start group chatting');
      var currentAgentRecords = agentRecords.filter(agent => currentGroup?.agentNames.includes(agent.name));
      var currentAgents = currentAgentRecords.map(agent => AgentProvider.getProvider(agent)(agent));
      var firstGPTAgents = currentAgents.filter(agent => agent instanceof GPTAgent)[0] as GPTAgent | undefined;
      var llmToUse = firstGPTAgents?.llm;
      if(llmToUse == undefined){
        throw new Error('No GPT agent available');
      }
      var llmModel = LLMProvider.getProvider(llmToUse)(llmToUse);
      var userAgent = new UserProxyAgent("You");
      var chat = new GroupChat({
        name: currentGroup.name,
        agents: currentAgents,
        llm: llmModel,
        admin: userAgent,
        messageHandler: addNewMessageToConversationHandler,
        reselectSpeakerHandler: reselectSpeakerHandler,
        maxRound: currentGroup.maxRound ?? 10,
        selectSpeakerMode: currentGroup.selectSpeakerMode ?? 'semi-auto',
        initialMessages: currentGroup.initialMessages ?? [],
      });
      chat.addInitialConversation("Hey, welcome to the group chat", userAgent);
      for(let agent of currentAgents){
        chat.addInitialConversation("Hey", agent)
      }

      await chat.callAsync(converstion, round);
    }

    const onClearChatHistory = () => {
      if (confirm('Are you sure you want to clear all messages?')) {
        setCurrentConversation([]);
      }
    }

    const onHandleCreateGroup = (group: IGroupRecord, originalGroup?: IGroupRecord ) => {
      // first check if the group already exists
      try{
        Debug(`add or update group ${group.name}`);
        if(originalGroup != undefined){
          storageDispatcher({type: 'updateGroup', payload: group, original: originalGroup});
        }
        else{
          storageDispatcher({type: 'addGroup', payload: group});
        }
      }
      catch(e){
        alert(e);
        return;
      }

      setOpenCreateGroupDialog(false);
    }

    const onHandleSelectGroup = (group?: IGroupRecord) => {
      if(group == undefined){
        setCurrentGroup(undefined);
        setCurrentConversation(undefined);

        return;
      }
      group.agentNames = group.agentNames.filter(agent => agentRecords.find(a => a.name === agent));
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

    const onDeleteMessage = (message: IChatMessageRecord, index: number) => {
      currentConversation!.splice(index, 1);
      setCurrentConversation(currentConversation!);
      storageDispatcher({type: 'updateGroup', payload: {...currentGroup!, conversation: currentConversation!}})
    }

    const onResendMessage = async (message: IChatMessageRecord, index: number) => {
      var resendMessage = currentConversation![index];
      currentConversation!.splice(index, 1);
      setCurrentConversation(currentConversation!);
      storageDispatcher({type: 'updateGroup', payload: {...currentGroup!, conversation: currentConversation!}})
      addNewMessageToConversationHandler(resendMessage);
      await startGroupChatHandler(currentConversation?.filter(m => IsChatMessage(m)) as IChatMessageRecord[]);
    }

    if (currentConversation == undefined && groupRecords?.length == 0){
      return (
        <CentralBox
              sx={{
                width: "100%",
                height: "100%",
              }}>
                {agentRecords?.length == 0 &&
                <LargeLabel>No agent available, create agent first please</LargeLabel>
                }
                {agentRecords && agentRecords.length > 0 &&
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
                <GroupConfigModal
                  open={openCreateGroupDialog}
                  agents={agentRecords}
                  onCancel={() => setOpenCreateGroupDialog(false)}
                  onSaved={onHandleCreateGroup}/>
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
        <GroupConfigModal
          open={openCreateGroupDialog}
          agents={agentRecords}
          onCancel={() => setOpenCreateGroupDialog(false)}
          onSaved={onHandleCreateGroup} />
        {groupRecords?.length > 0 &&
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
                groups={groupRecords}
                agents={agentRecords}
                onGroupSelected={onHandleSelectGroup}
                storageDispatcher={storageDispatcher}
                onUpdateGroup={onHandleCreateGroup}/>
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
                  agents={agentRecords}
                  logLevel={currentGroup?.logLevel}
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
                marginLeft: 2,
                marginRight: 2,
              }}>
                {
                  selectSpeakerResolver.resolvedAgent && selectSpeakerResolver.availableAgents && selectSpeakerResolver.prompt &&
                  <div
                    className="flex flex-col space-y-1">
                    <TinyLabel>{selectSpeakerResolver.prompt}</TinyLabel>
                    <div
                      className='flex flex-row flex-wrap justify-center  '>
                  {
                    selectSpeakerResolver.availableAgents.map((agent, index) => (
                      <button
                        key={index}
                        className='border-solid rounded bg-cyan-300 hover:bg-cyan-400 m-1 mx-5 px-3 text-xs text-slate-600 text-slack-200 font-apple-system'
                        onClick={() => {
                          selectSpeakerResolver.resolvedAgent!(agent);
                          setSelectSpeakerResolver({});
                        }}>
                        {agent.name}
                      </button>
                    ))
                  }
                  <button
                    className='border-solid rounded bg-orange-300 hover:bg-orange-400 m-1 mx-5 px-3 text-xs text-slate-600 font-apple-system'
                    onClick={() => {
                      selectSpeakerResolver.resolvedAgent!(undefined);
                      setSelectSpeakerResolver({});
                    }}>
                    Cancel
                  </button>
                </div>
            </div>
          }

              
                <ChatInput
                    messageIsStreaming={false}
                    onClearChatHistory={onClearChatHistory}
                    onSend={async (message) => {
                      addNewMessageToConversationHandler(message);
                      var updatedConversation = [...currentConversation??[], message];
                      await startGroupChatHandler(updatedConversation.filter(m => IsChatMessage(m)) as IChatMessageRecord[]);
                    }} />
              
            </Box>}

          {currentGroup && currentGroup.agentNames.length == 0 && 
          <CentralBox
            sx={{
              width: "100%",
              height: "100%",
            }}>
              <Typography variant="h4">{`No agent available in ${currentGroup.name}, add agent first`}</Typography>
          </CentralBox>
            }
        </Grid>
      </Grid>
    );
  };
Chat.displayName = 'Chat';