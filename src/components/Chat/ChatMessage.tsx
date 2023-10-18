import { IconEdit, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { FC, memo, useEffect, useRef, useState } from 'react';
import { Avatar, Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { SmallAvatar, SmallLabel, TinyAvatar, TinyLabel } from '../Global/EditableSavableTextField';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { IChatMessageRecord, IMessageRecord, IsUserMessage } from '@/message/type';
import { IAgentRecord } from '@/agent/type';
import { MessageProvider } from '@/message/messageProvider';
import { MessageElement } from '@/message';

interface Props {
  message: IChatMessageRecord;
  agent?: IAgentRecord;
  onDeleteMessage?: (message: IChatMessageRecord) => void;
  onResendMessage?: (message: IChatMessageRecord) => void;
}

export const ChatMessage: FC<Props> = memo(
  ({ message, agent, onDeleteMessage, onResendMessage}) => {
    const { t } = useTranslation('chat');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [messageContent, setMessageContent] = useState(message.content);
    const [messagedCopied, setMessageCopied] = useState(false);
    const isUser = IsUserMessage(message);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // const copyOnClick = () => {
    //   if (!navigator.clipboard) return;

    //   navigator.clipboard.writeText(message.content.toString()).then(() => {
    //     setMessageCopied(true);
    //     setTimeout(() => {
    //       setMessageCopied(false);
    //     }, 2000);
    //   });
    // };

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [isEditing]);

    const onDeleteMessageHandler = () => {
      if (confirm('Are you sure you want to delete this message???') && onDeleteMessage != undefined) {
        onDeleteMessage(message);
      }
    };

    const onResendMessageHandler = () => {
      if (confirm('Are you sure you want to resend this message?') && onResendMessage) {
        onResendMessage(message);
      }
    };

    return (
          <Stack
            direction={ isUser ? "row-reverse" : "row"}
            spacing={2}
            sx={{
              ":hover": {
                '& .toolBar': {
                  visibility: 'visible',
                }
              },
            }}>
            {!isUser && <TinyAvatar avatarKey={agent?.avatar!}/>}
            <Box
              sx={{
                backgroundColor: 'background.secondary',
                borderRadius: 2,
                maxWidth: '80%',
              }}>
              <Stack
                direction="column"
                spacing={1}
                sx={{
                  padding: 2,
                  pt: 1,
                }}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  alignItems: 'center',
                }}>
              {isUser ?
                <TinyLabel>You</TinyLabel> :
                <TinyLabel>{message.from}</TinyLabel>
              }
              {
                message.timestamp &&
                <TinyLabel>{new Date(message.timestamp).toLocaleString()}</TinyLabel>
              }
                <Stack
                  direction="row"
                  spacing={1}
                  className='toolBar'
                  sx={{
                    justifyContent: 'flex-end',
                    flexGrow: 1,
                    visibility: 'hidden',
                  }}>
                  {isUser &&
                  <Tooltip
                    title='resend this message'>
                    <IconButton
                      onClick={onResendMessageHandler}>
                      <RefreshIcon
                        sx={{
                          color: 'text.secondary',
                          fontSize: '1rem',
                        }} />
                    </IconButton>
                  </Tooltip>
                  }
                  <Tooltip
                    title='delete this message'>
                    <IconButton
                      onClick={onDeleteMessageHandler}
                      size='small'>
                      <DeleteOutlineIcon
                        sx={{
                          color: 'text.secondary',
                          fontSize: '1rem',
                        }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
              <Box
                sx={{
                  overflow: 'scroll',
                }}>
                <MessageElement message={message} />
              </Box>
              </Stack>
            </Box>
          </Stack>
    );
  });
ChatMessage.displayName = 'ChatMessage';
