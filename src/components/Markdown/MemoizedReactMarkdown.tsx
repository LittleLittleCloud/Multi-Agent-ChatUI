import { FC, memo } from 'react';
import ReactMarkdown, { Options } from 'react-markdown';
import { Markdown } from '../Global/Markdown';

export const MemoizedReactMarkdown: FC<Options> = memo(Markdown, (prevProps, nextProps) => {
    return prevProps.content === nextProps.content;
});
