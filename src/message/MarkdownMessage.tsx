import { SmallLabel, TinyClickableLabel, TinyLabel } from "@/components/Global/EditableSavableTextField";
import { MemoizedReactMarkdown } from "@/components/Markdown/MemoizedReactMarkdown";
import { Stack, Divider, Box } from "@mui/material";
import React from "react";
import { IChatMessageRecord } from "./type";

export interface IMarkdownMessageRecord extends IChatMessageRecord {
    type: 'message.markdown',
}

export const MarkdownMessage = (message: IMarkdownMessageRecord, onChange: (message: IMarkdownMessageRecord) => void) => {
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