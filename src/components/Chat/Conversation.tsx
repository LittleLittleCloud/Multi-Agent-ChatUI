import { IMessage } from '@/message/type';
import { Box, List } from '@mui/material';
import React from 'react';
import { ChatMessage } from './ChatMessage';
import { IAgent } from '@/agent/type';

interface ConversationProps {
    conversation: IMessage[];
    agents: IAgent[];
    onResendMessage: (message: IMessage, index: number) => void;
    onDeleteMessage: (message: IMessage, index: number) => void;
}

export const Conversation: React.FC<ConversationProps> = ({ conversation, onDeleteMessage, onResendMessage, agents }) => {
    return (
        <List
            sx={{
              overflow: "scroll",
            }}>
            {conversation?.map((message, index) => (
              <Box
                key={index}
                sx={{
                  marginTop: 2,
                  marginRight: 5,
                }}>
                <ChatMessage
                  key={index}
                  message={message}
                  agent={agents.find(agent => agent.alias === message.from)}
                  onDeleteMessage={(message) => onDeleteMessage(message, index)}
                  onResendMessage={(message) => onResendMessage(message, index)}
                  />
                </Box>
            ))}
        </List>
    );
};
