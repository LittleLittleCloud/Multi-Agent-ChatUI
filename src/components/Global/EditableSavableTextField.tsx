import {
    FC,
    memo,
    MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
  } from 'react';

import { Box, Select, InputLabel, Container, List, ListItem, Stack, Typography, Avatar, Button, ListItemButton, ListItemIcon, ListItemText, Divider, TextField, MenuItem, FormControl, TextFieldProps, BaseTextFieldProps, SelectProps, Tooltip, IconButton, Slider, ListItemBaseProps, ListItemProps, AvatarProps, Switch } from '@mui/material';
import styled from '@emotion/styled';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { ImageBlobStorage } from '@/utils/blobStorage';
import { IAgent } from '@/types/agent';

export const EditableSavableTextField = (props: {name: string, value?: string, onChange: (valueS: string) => void}) => {
    const [value, setValue] = useState(props.value);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        setValue(props.value);
    }, [props.value]);
    return (
        <Stack direction="row" spacing={1}>
            <SmallTextField
                value={value}
                label={props.name}
                onChange={(e) => setValue(e.target.value)}
                disabled={!isEditing}
                fullWidth
                multiline
            />
            <Button
                onClick={() => {
                    if (isEditing && value != props.value) {
                        setIsSaving(true);
                        props.onChange(value!);
                        setIsSaving(false);
                    }
                    setIsEditing(!isEditing);
                }}
                disabled={isSaving}>
                {isEditing ? "Save" : "Edit"}
            </Button>
        </Stack>
    )
}

export const EditableSelectField = (props: {name: string, value?: string, onChange: (value: string) => void, options: string[]}) => {
    const [value, setValue] = useState(props.value);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    return (
        <Stack direction="row" spacing={1}>
            <FormControl fullWidth>
            <InputLabel id="editable-select-label">{props.name}</InputLabel>
            <Select
                labelId='editable-select-label'
                value={value}
                label={props.name}
                onChange={(e) => setValue(e.target.value)}
                disabled={!isEditing}
            >
                {props.options.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
            </Select>
            </FormControl>
            
        </Stack>
    )
}

export const SmallSelectField = (props: {name?: string, value?: string, onChange: (value: string) => void, options: string[]}) => {
    const [value, setValue] = useState(props.value ?? "");
    useEffect(() => {
        setValue(props.value ?? "");
    }, [props.value]);
    const onValueChange = (value?: string) =>{
        if(value != undefined){
            setValue(value);
            props.onChange(value);
        }
    }
    return (
        <FormControl fullWidth>
        <InputLabel id="editable-select-label">{props.name}</InputLabel>
        <Select
            labelId='editable-select-label'
            value={value}
            label={props.name}
            sx={{
                '& .MuiOutlinedInput-root': {
                    padding: '0.5rem',
                }
            }}
            onChange={(e) => onValueChange(e.target.value)}
        >
            {props.options.map((option) => (
                <MenuItem key={option} value={option}>
                    {option}
                </MenuItem>
                ))}
        </Select>
        </FormControl>
    )
}

export const SmallMultipleSelectField = (props: {name?: string, value?: string[], onChange: (value: string[]) => void, options: string[]}) => {
    const [value, setValue] = useState(props.value);
    const [options, setOptions] = useState(props.options);
    useEffect(() => {
        setValue(props.value);
        setOptions(props.options);
    }, [props]);

    useEffect(() => {
        if(value != props.value && props.value != undefined){
            props.onChange(value);
        }
    }, [value]);

    return (
        <FormControl fullWidth>
        <InputLabel id="editable-select-label">{props.name}</InputLabel>
        <Select
            labelId='editable-select-label'
            value={value}
            label={props.name}
            multiple
            sx={{
                lineHeight: '1.5rem',
            }}
            onChange={(e) => setValue(e.target.value as string[])}
        >
            {options.map((option) => (
                <MenuItem key={option} value={option}>
                    {option}
                </MenuItem>
                ))}
        </Select>
        </FormControl>
    )
}

export const SettingSection = (props: {title?: string, toolTip?: string, children: React.ReactNode}) => {
    return (
        <Stack
            direction="column"
            spacing={2}
            sx={{
                backgroundColor: 'background.secondary',
                borderRadius: '1.3rem',
                padding: '1.7rem',
                pt: '1.2rem',
            }}>
            <CentralBox>
                <Tooltip
                    title={props.toolTip ?? ""}
                    placement="top"
                    arrow>
                <SmallLabel>{props.title}</SmallLabel>
                </Tooltip>
            </CentralBox>
            
            {props.children}
        </Stack>
    )
}

const SaveCancelButtonGroup = (props: {onConfirm: () => void, onCancel: () => void}) => {
    return (
        <>
        <Tooltip
                title="Save"
                placement="top"
                arrow>
            <IconButton
                onClick={props.onConfirm}>
                <CheckIcon
                    fontSize='small'
                    color='primary'/>
            </IconButton>
            </Tooltip>
            <Tooltip
                title="Cancel"
                placement="top"
                arrow>
            <IconButton
                onClick={props.onCancel}>
                <ClearIcon
                    fontSize='small'
                    color='primary'/>
            </IconButton>
            </Tooltip>
        </>);
};

export const SmallNumberSetting = (props: {name: string, toolTip?: string, value?: number, min: number, max: number, step?: number, onChange: (value: number) => void}) => {
    const [value, setValue] = useState(props.value);
    const [isEditing, setIsEditing] = useState(false);

    const step = props.step ?? (props.max - props.min) / 100;
    useEffect(() => {
        setValue(props.value);
        setIsEditing(false);
    }, [props.value]);

    const onValueChange = (value?: number) =>{
        if(value != props.value){
            setValue(value);
            setIsEditing(true);
        }
        else{
            setIsEditing(false);
            setValue(value);
        }
    }

    return (
        <Stack direction="column" spacing={1}>
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: "center",
            }}>
            <Box

                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: '20%',
                }}>
            <Tooltip
                title={props.toolTip ?? ""}
                placement="top"
                arrow>
            <SmallLabel>{isEditing ? `${props.name}*`: props.name}</SmallLabel>
            </Tooltip>
            </Box>
            <Stack
                direction="row"
                spacing={3}
                sx={{
                    width: '80%',
                }}>
                <SmallTextField
                    value={value?.toString() ?? ""}
                    onChange={(e) => onValueChange(Number(e.target.value))}
                    type="number"
                    sx={{
                        width: '20%',
                    }}
                />
            <Stack
                direction="row"
                spacing={3}
                sx={{
                    width: '80%',
                    alignItems: "center",
                }}>
                <CentralBox
                    sx={{
                        width: '15%',
                    }}>
                <SmallLabel>{props.min}</SmallLabel>
                </CentralBox>
                <Slider
                    value={value}
                    onChange={(e, value) => onValueChange(value as number)}
                    min={props.min}
                    max={props.max}
                    valueLabelDisplay='auto'
                    step={step}
                    sx={{
                        width: '70%',
                    }}
                    />
                <CentralBox
                    sx={{
                        width: '15%',
                    }}>
                <SmallLabel>{props.max}</SmallLabel>
                </CentralBox>
            </Stack>
            </Stack>
        </Stack>
        {isEditing &&
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: '100%',
                }}>
                <SaveCancelButtonGroup
                    onConfirm={() => props.onChange(value as number)}
                    onCancel={() =>{
                        setValue(props.value);
                        setIsEditing(false);
                    }}/>
            </Box>
        }
        </Stack>
    )
}

export const SelectableListItem = (props: ListItemProps & {selected: boolean}) => {
    return (
        <Box
            sx={{
                margin: '0.5rem',
                padding: '0rem',
                borderRadius: '1rem',
                backgroundColor: props.selected ? 'background.secondary' : 'background.default',
            }}>
        <ListItem
            {...props}
            selected={false}
            sx={{
              padding: '0rem',
              margin: '0rem',
              borderRadius: '1rem',
            }}/>
        </Box>
    )
}

export const SmallTextSetting = (props: {name: string, toolTip?: string, value?: string, onChange?: (value: string) => void}) => {
    const [value, setValue] = useState(props.value);
    const [isEditing, setIsEditing] = useState(false);
    useEffect(() => {
        setValue(props.value);
        setIsEditing(false);
    }, [props.value]);

    const onValueChange = (value?: string) =>{
        if(value != props.value){
            setValue(value);
            setIsEditing(true);
        }
        else{
            setIsEditing(false);
            setValue(value);
        }
    }

    return (
        <Stack
            direction="column"
            spacing={1}
            sx={{
                width: '100%',
            }}>
        <Stack
            direction="row"
            spacing={1}
            >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: '20%',
                }}>
            <Tooltip
                title={props.toolTip ?? ""}
                placement="top"
                arrow>
                <SmallLabel>{isEditing? `${props.name}*` : props.name}</SmallLabel>
            </Tooltip>
            </Box>
            <SmallTextField
                value={value}
                disabled={props.onChange == undefined}
                onChange={(e) => onValueChange(e.target.value)}
                multiline
                sx={{
                    width: '80%',
                    '& .MuiOutlinedInput-root': {
                    }
                }}/>
        </Stack>
        {isEditing &&
        <Box
            sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: '100%',
            }}>
            <SaveCancelButtonGroup
                onConfirm={() => {
                    if (isEditing) {
                        props.onChange(value!);
                    }
                    setIsEditing(!isEditing);
                }}
                onCancel={() => {
                    setIsEditing(false);
                    setValue(props.value);
                }}/>
        </Box>
        }
        </Stack>
    )
};

export const SmallSelectSetting = (props: {name: string, toolTip?: string, value?: string, onChange: (value: string) => void, options: string[]}) => {
    const [value, setValue] = useState(props.value);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setValue(props.value);
        setIsEditing(false);
    }, [props.value]);

    const onValueChange = (value?: string) =>{
        if(value != props.value){
            setValue(value);
            setIsEditing(true);
        }
        else{
            setIsEditing(false);
            setValue(value);
        }
    }

    return (
        <Stack direction="column" spacing={1}>
        <Stack direction="row" spacing={1}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: '20%',
                }}>
            <Tooltip
                title={props.toolTip ?? ""}
                placement="top"
                arrow>
                <SmallLabel>{props.name}</SmallLabel>
            </Tooltip>
            </Box>
            <CentralBox
                sx={{
                    width: '80%',
                }}>
            <SmallSelectField
                value={value}
                onChange={(value) => onValueChange(value)}
                options={props.options}
            />
            </CentralBox>
        </Stack>
        {isEditing &&
        <Box
            sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: '100%',
            }}>
            <SaveCancelButtonGroup
                onConfirm={() => {
                    if (isEditing) {
                        props.onChange(value!);
                    }
                    setIsEditing(!isEditing);
                }}
                onCancel={() => {
                    setIsEditing(false);
                    setValue(props.value);
                }}/>
        </Box>}
        </Stack>
    )
};

export const SmallMultipleSelectSetting = (props: {name: string, toolTip?: string, value?: string[], onChange: (value: string[]) => void, options: string[]}) => {
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    return (
        <Stack direction="row" spacing={1}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: '20%',
                }}>
            <Tooltip
                title={props.toolTip ?? ""}
                placement="top"
                arrow>
                <SmallLabel>{props.name}</SmallLabel>
            </Tooltip>
            </Box>
            <SmallMultipleSelectField
                value={value}
                onChange={(value) => setValue(value)}
                options={props.options}
            />  
        </Stack>
    )
};

export const SmallToggleSetting = (props: {name: string, toolTip?: string, value?: boolean, onChange: (value: boolean) => void}) => {
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    return (
        <Stack
            direction="row"
            spacing={1}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: '20%',
                }}>
                <SmallLabel>{props.name}</SmallLabel>
            </Box>
            <Box
                sx={{
                    alignItems: "center",
                    display: "flex",
                    width: '80%',
                }}>
                <SmallLabel
                    sx={{
                        flexGrow: 1,
                    }}
                    color='text.secondary' >{props.toolTip}</SmallLabel>
            <Switch
                checked={value}
                onChange={(e) => props.onChange(e.target.checked)}/>
            </Box>
        </Stack>
    )
};


export function useEffectAsync(effect: () => Promise<void>, inputs?: any[]): void
{
    useEffect(() => {
        effect();
    }, inputs);
}

export const SmallAvatar = (props: AvatarProps & {avatarKey: string}) => {
    const [src, setSrc] = useState(props.src);
    useEffectAsync(async () => {
        if(props.src){
            URL.revokeObjectURL(src!);
        }
        if(props.avatarKey){
            var imageStorage = await ImageBlobStorage;
            var blob = await imageStorage.getBlob(props.avatarKey);
            if(blob){
                setSrc(URL.createObjectURL(blob));
            }
        }
        else{
            setSrc(undefined);
        }
    }, [props.avatarKey]);

    return (
        <Avatar
            {...props}
            sx={{
                width: '3rem',
                height: '3rem',
            }}
            src={src}/>
    )
}

export const LargeAvatar = styled(SmallAvatar)<AvatarProps & {avatarKey: string}>(({theme}) => ({
    width: '6rem',
    height: '6rem',
}));

export const TinyAvatar = styled(SmallAvatar)<AvatarProps & {avatarKey: string}>(({theme}) => ({
    width: '2rem',
    height: '2rem',
}));

export const Label = styled(Typography)(({theme}) => ({
    textTransform: 'none',
}));

export const LargeLabel = styled(Label)(({theme}) => ({
    fontSize: '1.2rem',
    lineHeight: '2rem',
}));

export const SmallLabel = styled(Label)(({theme}) => ({
    fontSize: '0.8rem',
    lineHeight: '1.5rem',
}));

export const TinyLabel = styled(Label)(({theme}) => ({
    fontSize: '0.7em',
    lineHeight: '1rem',
}));

export const SmallTextField = styled(TextField)<BaseTextFieldProps>(({theme}) => ({
    '& .MuiOutlinedInput-root': {
        fontSize: '1rem',
        lineHeight: '1.5rem',
    },
}));

export const SmallSelect = styled(Select)(({theme}) => ({
    borderRadius: '0.25rem',
    lineHeight: '1.5rem',
    fontSize: '1rem',
}));

export const CentralBox = styled(Box)(({theme}) => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}));

export const SmallClickableLabel = styled(SmallLabel)(({theme}) => ({
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    }
}));

export const LargeClickableLabel = styled(LargeLabel)(({theme}) => ({
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    }
}));

export const TinyClickableLabel = styled(TinyLabel)(({theme}) => ({
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    }
}));

export const SmallTextButton = styled(Button)(({theme}) => ({
    ...theme.typography.button,
    padding: '0.25rem',
    textTransform: 'none',
    fontSize: '1rem',
    lineHeight: '1.5rem',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    }
}));

export const TinyTextButton = styled(Button)(({theme}) => ({
    ...theme.typography.button,
    padding: '0.15rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    textTransform: 'none',
    fontSize: '0.8rem',
    lineHeight: '1.2rem',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    }
}));
