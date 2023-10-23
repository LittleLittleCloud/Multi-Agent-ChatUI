import { IAgentRecord } from "@/agent/type";
import { Tooltip } from "@mui/material";
import { FC } from "react";
import { SmallLabel } from "../Global/EditableSavableTextField";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export interface AgentListItemProps {
    agent: IAgentRecord;
    selected: boolean;
    onClick?: (agent: IAgentRecord) => void;
    onDeleted?: (agent: IAgentRecord) => void;
    onCloned?: (agent: IAgentRecord) => void;
}

export const AgentListItem: FC<AgentListItemProps> = (props) => {
    const selected = props.selected;
    const agent = props.agent;

    const Element = (
        <div
            className="flex justify-between cursor-pointer"
            onClick={() => props.onClick?.(agent)}>
            <div>
                <SmallLabel>{agent.name}</SmallLabel>
            </div>

            <div>
            <Tooltip title="clone this agent" placement="top">
            <AddIcon
                onClick={(e) => {
                    e.stopPropagation();
                    props.onCloned?.(agent);
                }}/>
            </Tooltip>
            <Tooltip title="delete this agent" placement="top">
            <DeleteIcon
                color='error'
                onClick={(e) => {
                    e.stopPropagation();
                    props.onDeleted?.(agent);
                }}/>
            </Tooltip>
            </div>
        </div>
    )

    return selected ? (
        <div
            className="bg-neutral-300 dark:bg-neutral-600 px-2 pt-2 pb-2 m-1 rounded-md">
            {Element}
        </div>
    ) : (
        <div
            className="hover:bg-neutral-200 dark:hover:bg-neutral-700 px-2 pt-2 pb-2 m-1 rounded-md">
            {Element}
        </div>
    )
}