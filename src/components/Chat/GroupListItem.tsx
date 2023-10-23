import { IAgentRecord } from "@/agent/type";
import { IGroupRecord } from "@/chat/type";
import { Tooltip, Divider, AvatarGroup } from "@mui/material";
import { FC } from "react";
import { MediumLabel, TinyAvatar } from "../Global/EditableSavableTextField";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';

export interface GroupListItemProps{
    group: IGroupRecord;
    agents: IAgentRecord[];
    selected: boolean;
    onClick?: (group: IGroupRecord) => void;
    onDeleted?: (group: IGroupRecord) => void;
    onCloned?: (group: IGroupRecord) => void;
    onUpdated?: (group: IGroupRecord) => void;
  }
  
  export const GroupListItem: FC<GroupListItemProps> = (props) => {
    const selected = props.selected;
    const group = props.group;
  
    const Element = (
      <div
        className='flex flex-col cursor-pointer'
        onClick={() => props.onClick?.(group)}>
      <div
        className="flex justify-between bg-none">
        <div>
          <MediumLabel>{group.name}</MediumLabel>
        </div>
  
        <div>
          <Tooltip title="delete this group" placement="top">
          <DeleteIcon
            color='error'
            onClick={(e) => {
              e.stopPropagation();
              props.onDeleted?.(group);
            }}/>
          </Tooltip>
        </div>
  
      </div>
      <Divider />
      <div
        className='flex justify-between items-center pt-1'>
        <div>
          <Tooltip title={`agents: ${props.agents.map(a => a.name)}`} placement="top">
          <AvatarGroup
            max={4}>
            {props.agents.map((agentRecord, index) => {
              return (
                  <TinyAvatar
                  key={index}
                  src={agentRecord.avatar}
                    />
              )
            })}
          </AvatarGroup>
          </Tooltip>
        </div>
        
        <div>
        <Tooltip title="clone this group" placement="top">
        <AddIcon
          onClick={(e) => {
            e.stopPropagation();
            var clonedGroup = {...group};
            clonedGroup.name = `${clonedGroup.name}(1)`;
            props.onCloned?.(clonedGroup);
          }}/>
        </Tooltip>
        <Tooltip title="edit this group" placement="top">
        <SettingsIcon
          onClick={(e) => {
            e.stopPropagation();
            props.onUpdated?.(group);
          }}/>
        </Tooltip>
        
        </div>
      </div>
      </div>
    )
  
    return selected ? (
      <div
        className="bg-neutral-200 dark:bg-gray-700 px-2 pt-2 pb-2 m-1 rounded-md">
        {Element}
      </div>
    ) : (
      <div
        className="hover:bg-neutral-100 dark:hover:bg-stone-800 px-2 pt-2 pb-2 m-1 rounded-md">
        {Element}
      </div>
    )
  }