import { IChatMessageRecord, IMessageRecord, IsChatMessage } from '@/message/type';
import { Box, List } from '@mui/material';
import React from 'react';
import { ChatMessage } from './ChatMessage';
import { IAgentRecord } from '@/agent/type';
import { ILogMessageRecord, LogLevelsToPresent, LogMessage, LogMessageLevel, LogMessageType, LogMessageTypeString } from '@/message/LogMessage';
import { MessageElement } from '@/message';

interface ConversationProps {
    conversation: IMessageRecord[];
    agents: IAgentRecord[];
    onResendMessage: (message: IChatMessageRecord, index: number) => void;
    onDeleteMessage: (message: IChatMessageRecord, index: number) => void;
    logLevel?: LogMessageLevel;
}

export const Conversation: React.FC<ConversationProps> = ({ conversation, onDeleteMessage, onResendMessage, agents, logLevel }) => {
    const presentLogLoevels = LogLevelsToPresent(logLevel ?? 'info');
    return (
        <List
            sx={{
              overflow: "scroll",
            }}>
            {conversation?.map((message, index) => (
              <Box
                key={index}
                sx={{
                  marginTop: 1,
                  marginRight: 5,
                }}>
                  {
                    message.type === LogMessageTypeString &&
                    presentLogLoevels.includes((message as ILogMessageRecord).level) &&
                    <MessageElement message={message} />
                  }
                  {
                    IsChatMessage(message) &&
                    <ChatMessage
                      key={index}
                      message={message as IChatMessageRecord}
                      agent={agents.find(agent => agent.name === (message as IChatMessageRecord).from)}
                      onDeleteMessage={(message) => onDeleteMessage(message, index)}
                      onResendMessage={(message) => onResendMessage(message, index)}
                      />
                  }
              </Box>
            ))}
        </List>
    );
};
