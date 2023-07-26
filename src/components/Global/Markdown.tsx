import { Box, Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import ReactMarkdown from "react-markdown";
import { ReactMarkdownProps } from "react-markdown/lib/complex-types";
import { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";
import SyntaxHighlighter, { Light } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { CentralBox } from "./EditableSavableTextField";
import { CodeBlock } from "../Markdown/CodeBlock";
import remarkGfm from "remark-gfm";
import { ImageBlobStorage } from "@/utils/blobStorage";
import { Anchor, Image, MemorizedImage } from "../Markdown/Image";

export const Markdown = (props: ReactMarkdownOptions) => (
    <StyledMarkdown
        {...props}
        remarkPlugins={[remarkGfm]}
        components={{
            a: ({...props}) => <Anchor {...props}/>,
            img: ({...props}) => <MemorizedImage key={props.src} {...props}/>,
            code: ({node, inline, className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                <CodeBlock
                    language={match[1]}
                    value={String(children).replace(/\n$/, '')}
                    {...props}/>
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                )
            },
            ...props.components,
        }}/>
);

export const StyledMarkdown = styled(ReactMarkdown)<ReactMarkdownOptions>(({theme}) => ({
    '& p': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& h1': {
        fontSize: '1.5rem',
        lineHeight: '2rem',
    },
    '& h2': {
        fontSize: '1.25rem',
        lineHeight: '1.75rem',
    },
    '& h3': {
        fontSize: '1.1rem',
        lineHeight: '1.5rem',
    },
    '& h4': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& h5': {
        fontSize: '0.9rem',
        lineHeight: '1.5rem',
    },
    '& h6': {
        fontSize: '0.8rem',
        lineHeight: '1.5rem',
    },
    '& ul': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& ol': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& li': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& blockquote': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& a': {
        fontSize: '1rem',

    },
    '& img': {
        maxWidth: '100%',
        height: 'auto',
    },
    '& table': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& thead': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& tbody': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& tr': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& th': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& td': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& hr': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& pre': {
        lineHeight: '1.5rem',
        overflow: 'scroll',
    },
    '& code': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& kbd': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& samp': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& var': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& sub': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& sup': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& b': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
    '& strong': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
}));