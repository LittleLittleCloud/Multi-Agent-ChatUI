import { SmallLabel, TinyClickableLabel, TinyLabel } from "@/components/Global/EditableSavableTextField";
import { MemoizedReactMarkdown } from "@/components/Markdown/MemoizedReactMarkdown";
import { Stack, Divider, Box } from "@mui/material";
import React from "react";
import { IChatMessageRecord } from "./type";

export type MarkdownMessageType = 'message.markdown';

export interface IMarkdownMessageRecord extends IChatMessageRecord {
    type: MarkdownMessageType,
}

export const MarkdownMessage = (message: IMarkdownMessageRecord) => {
    const content = message.content;
    const [openContent, setOpenContent] = React.useState<'markdown' | 'plain text'>("markdown");
    return (
        <Stack
            direction="column"
            spacing={1}>
            {
                openContent === 'markdown' &&
                <MemoizedReactMarkdown>
                    {content ?? ''}
                </MemoizedReactMarkdown>
            }
            {
                openContent === 'plain text' &&
                <SmallLabel>{content?.replace('\n', '<br />')}</SmallLabel>
            }
            <Stack
                direction="row"
                spacing={1}>
                {
                    <TinyClickableLabel
                        onClick={() => setOpenContent('markdown')}
                    >content</TinyClickableLabel>
                }
                <Divider orientation="vertical" flexItem />
                <TinyClickableLabel
                    onClick={() => setOpenContent('plain text')}
                    >plain text</TinyClickableLabel>
            </Stack>
        </Stack>
    )
}