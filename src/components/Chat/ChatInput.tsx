import { OpenAIModel, OpenAIModelID } from '@/types/openai';
import { Prompt } from '@/types/prompt';
import { IconPlayerStop, IconRepeat, IconSend } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import {
  FC,
  KeyboardEvent,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { PromptList } from './PromptList';
import { VariableModal } from './VariableModal';
import { Box, Button, ButtonGroup, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { CentralBox, Label, SmallClickableLabel, SmallLabel, SmallTextButton, TinyLabel, TinyTextButton } from '../Global/EditableSavableTextField';
import { Markdown } from '../Global/Markdown';
import { ChatBlobStorage, ImageBlobStorage } from '@/utils/blobStorage';
import { IMessage } from '@/message/type';

interface Props {
  messageIsStreaming: boolean;
  onSend: (message: IMessage) => void;
}

export const ChatInput: FC<Props> = ({
  messageIsStreaming,
  onSend,
}) => {
  const { t } = useTranslation('chat');

  const [content, setContent] = useState<string>();
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showPromptList, setShowPromptList] = useState(false);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [promptInputValue, setPromptInputValue] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [preview, setPreview] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const promptListRef = useRef<HTMLUListElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const maxLength = 12000;

    if (value.length > maxLength) {
      alert(
        t(
          `Message limit is {{maxLength}} characters. You have entered {{valueLength}} characters.`,
          { maxLength, valueLength: value.length },
        ),
      );
      return;
    }

    setContent(value);
    updatePromptListVisibility(value);
  };

  const handleSend = () => {
    if (messageIsStreaming) {
      return;
    }

    if (!content) {
      alert(t('Please enter a message'));
      return;
    }
    var now = Date.now();
    onSend({ from: 'Human', content, type: 'message.markdown', timestamp: now });
    setContent('');

    if (window.innerWidth < 640 && textareaRef && textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  const isMobile = () => {
    const userAgent =
      typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    return mobileRegex.test(userAgent);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPromptList) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex,
        );
      } else if (e.key === 'Tab') {
        e.preventDefault();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // handleInitModal();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowPromptList(false);
      } else {
        setActivePromptIndex(0);
      }
    } else if (e.key === 'Enter' && !isMobile() && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const parseVariables = (content: string) => {
    const regex = /{{(.*?)}}/g;
    const foundVariables = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      foundVariables.push(match[1]);
    }

    return foundVariables;
  };

  const updatePromptListVisibility = useCallback((text: string) => {
    const match = text.match(/\/\w*$/);

    if (match) {
      setShowPromptList(true);
      setPromptInputValue(match[0].slice(1));
    } else {
      setShowPromptList(false);
      setPromptInputValue('');
    }
  }, []);

  const handlePromptSelect = (prompt: Prompt) => {
    const parsedVariables = parseVariables(prompt.content);
    setVariables(parsedVariables);

    if (parsedVariables.length > 0) {
      setIsModalVisible(true);
    } else {
      setContent((prevContent) => {
        const updatedContent = prevContent?.replace(/\/\w*$/, prompt.content);
        return updatedContent;
      });
      updatePromptListVisibility(prompt.content);
    }
  };

  const uploadFileHandler = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      // first, check if file is image or one of [csv, tsv, json, txt, pdf]
      // if not, throw an alert and return
      let allowedFileTypes = ['image', 'text'];
      let allowedExtensions = ['csv', 'tsv', 'json', 'txt', 'pdf'];
      let fileType = file.type.split('/')[0];
      let fileExtension = file.name.split('.').pop();
      if (!allowedFileTypes.includes(fileType) && !allowedExtensions.includes(fileExtension)) {
        alert('File type not supported, please upload an image or text file');
        return;
      }

      let blobStorage = await ChatBlobStorage;
      // update file name with timestamp
      let fileName = `${Date.now()}-${file.name}`;
      let blob = new Blob([e.target?.result!]);
      await blobStorage.saveBlob(blob, fileName);
      // insert into text value
      setContent((prevContent) => {
        let isImage = fileType === 'image';
        let insertText = isImage ? `![](${fileName})` : `[${fileName}](${fileName})`;
        // insert to text area ref. selectionstart
        if (textareaRef && textareaRef.current) {
          if (prevContent === undefined) {
            return insertText;
          }
          
          let textArea = textareaRef.current;
          let startPos = textArea.selectionStart;
          let endPos = textArea.selectionEnd;
          let content = prevContent?.substring(0, startPos) + insertText + prevContent?.substring(endPos, prevContent.length);
          
          return content;
        }
      });
    };
    reader.readAsArrayBuffer(file);
  }

  const handleUploadFile = ({target}: {target: HTMLInputElement}) => {
    if (!target.files) {
      return;
    }
    const file = target.files[0];
    uploadFileHandler(file);
  };

  const dropHandler = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      let file = e.dataTransfer.files[0];
      uploadFileHandler(file);
    }
    setIsDragOver(false);
  };

  const dragEnterHandler = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const dragLeaveHandler = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  useEffect(() => {
    if (promptListRef.current) {
      promptListRef.current.scrollTop = activePromptIndex * 30;
    }
  }, [activePromptIndex]);

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
      textareaRef.current.style.overflow = `${
        textareaRef?.current?.scrollHeight > 400 ? 'auto' : 'hidden'
      }`;
    }
  }, [content]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        promptListRef.current &&
        !promptListRef.current.contains(e.target as Node)
      ) {
        setShowPromptList(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
        <CentralBox
          onDrop={dropHandler}
          onDragOver={dragEnterHandler}
          onDragLeave={dragLeaveHandler}
          sx={{
            borderRadius: '1rem',
          }}>
          <Stack
            direction="column"
            width="1"
            spacing={0.5}>
          {
            isDragOver &&
            <TinyLabel
              sx = {{
                color: 'text.secondary',
              }}>
              {t('Drop to upload')}
            </TinyLabel>
          }
          {
            !preview && 
            <TextField
            sx = {{
              '& .MuiOutlinedInput-root': {
                borderRadius: '0.5rem',
                fieldset: {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
            inputRef={textareaRef}
            multiline={true}
            placeholder={t('Type a message, markdown is supported') || ''}
            onChange={handleChange}
            value={content}/>
          }
          {
            preview &&
            <Box
              sx={{
                borderRadius: '0.5rem',
                border: '1px solid',
                borderColor: 'divider',
                padding: '1rem',
                overflow: 'scroll'
              }}>
              <Markdown
                height="10%"
              >{content ?? "nothing to preview"}</Markdown>
            </Box>
          }
            <Stack
              direction="row"
              spacing={1}>
              <ToggleButtonGroup
                size='small'
                sx={{
                  flexGrow: 1,
                }}>
                <ToggleButton
                  value="Write"
                  onClick={() => setPreview(false) }>
                  <TinyLabel>Write</TinyLabel>
                </ToggleButton>
                <ToggleButton
                  value="Preview"
                  onClick={() => setPreview(true)}>
                  <TinyLabel>Preview</TinyLabel>
                </ToggleButton>
                {/* <ToggleButton
                  component='label'>
                  <Tooltip title="Upload a File, supported format: csv, txt, tsv, json, pdf">
                    <TinyLabel>Upload a File</TinyLabel>
                  </Tooltip>
                  <input
                    type="file"
                    accept=".csv, .txt, .tsv, .json, .pdf"
                    onChange={handleUploadFile}
                    hidden/>
                </ToggleButton>
                <ToggleButton
                  component='label'>
                  <Tooltip title="Upload an image, supported format: png, jpg, jpeg, gif">
                    <TinyLabel>Upload an image</TinyLabel>
                  </Tooltip>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFile}
                    hidden/>
                </ToggleButton> */}
              </ToggleButtonGroup>

              <ButtonGroup
                size='small'>
                <TinyTextButton
                  onClick={handleSend}>
                    Send
                </TinyTextButton>
              </ButtonGroup>
            </Stack>
          </Stack>
        </CentralBox>
  );
};
