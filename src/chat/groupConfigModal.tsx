import { IAgentRecord } from "@/agent/type";
import { SmallTextField, SmallMultipleSelectField, SmallLabel, LargeLabel } from "@/components/Global/EditableSavableTextField";
import { Dialog, DialogTitle, DialogContent, Stack, DialogActions, Button } from "@mui/material";
import { FC, useState, useEffect } from "react";
import { IGroupRecord, SelectSpeakerMode } from "./type";
import { LogMessageLevel } from "@/message/LogMessage";
import { IMessageRecord } from "@/message/type";

export const GroupConfigModal: FC<{
    open: boolean,
    group?: IGroupRecord,
    agents: IAgentRecord[],
    onSaved: (group: IGroupRecord) => void,
    onCancel: () => void,
    messageHandler?: (msg: IMessageRecord) => void,}> = ({
      open,
      group,
      agents,
      onSaved,
      onCancel,
      messageHandler
    }) => {
    const [groupName, setGroupName] = useState(group?.name);
    const [selectAgents, setSelectAgents] = useState(group?.agentNames ?? []); // [agentId]
    const [speakerSelectionModel, setSpeakerSelectionModel] = useState(group?.selectSpeakerMode ?? 'semi-auto');
    const [maxRound, setMaxRound] = useState(group?.maxRound ?? 10);
    const [logLevel, setLogLevel] = useState(group?.logLevel ?? 'info');
    const availableLogLevel: LogMessageLevel[] = ['verbose', 'debug', 'info', 'warning', 'error'];
    const availableMode: SelectSpeakerMode[] = ['auto', 'semi-auto', 'manual'];
    const availableAgents: IAgentRecord[] = agents;
    useEffect(() => {
      setGroupName(group?.name);
      setSelectAgents(group?.agentNames ?? []);
    }, [group]);
  
    const onSavedHandler = () => {
        // verification
        if(groupName == undefined || groupName == ''){
          alert('Group name is required');
          return;
        }

        if(selectAgents.length == 0){
          alert('At least one agent is required');
          return;
        }

        if(maxRound == undefined || maxRound < 1){
          alert('Max round must be greater than 0');
          return;
        }

        if(availableMode.indexOf(speakerSelectionModel) < 0){
          alert('Invalid speaker selection model');
          return;
        }

        if(availableLogLevel.indexOf(logLevel) < 0){
          alert('Invalid log level');
          return;
        }
        
        onSaved({
          ...group ?? {},
          name: groupName,
          agentNames: selectAgents,
          logLevel: logLevel,
          maxRound: maxRound,
          selectSpeakerMode: speakerSelectionModel,
         } as IGroupRecord);
    };
  
  
    return (!open ? <></> :
    <div
      className="relative z-10"
      role="dialog"
      aria-modal="true">

      <div
        className="fixed inset-0 overflow-y-auto z-10 w-screen">
        <div className="flex items-end  justify-center p-4 text-center sm:items-center sm:p-0">
        <div className=" rounded-lg  bg-neutral-100 dark:bg-neutral-900 text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg">
          <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start space-x-2">
              <LargeLabel>Edit Group</LargeLabel>
            </div>
            <SmallLabel sx={{
              marginTop: '1rem',
            }}>Group Name</SmallLabel>
            <div className="flex rounded-md shadow-sm ring-1 ring-inset focus-within:ring-2 sm:max-w-md mt-2">
              <input
                className="flex-1 border-0 bg-transparent py-1 pl-2 text-slate-900 dark:text-slate-100 focus:ring-0 focus-within:ring-0 sm:text-sm sm:leading-6" 
                type="text"
                value={groupName} 
                onChange={(e) => setGroupName((e.target as HTMLInputElement).value)} />
            </div>
            <SmallLabel sx={{
              marginTop: '1rem',
            }}>Max round</SmallLabel>
            <div className="flex rounded-md shadow-sm ring-1 ring-inset focus-within:ring-2 sm:max-w-md mt-2">
              <input
                className="flex-1 border-0 bg-transparent py-1 pl-2  text-slate-900 dark:text-slate-100 focus:ring-0 focus-within:ring-0 sm:text-sm sm:leading-6" 
                type="number"
                value={maxRound} 
                onChange={(e) => setMaxRound(parseInt((e.target as HTMLInputElement).value))} />
            </div>
            <SmallLabel sx={{
              marginTop: '1rem',
            }}>Add/Remove Agents</SmallLabel>
            <div className="flex rounded-md shadow-sm  mt-2 space-x-5">
            {
              availableAgents.length > 0 &&
              availableAgents.map((agent, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2">
                  <input
                    id={agent.name}
                    name="agent"
                    type="checkbox"
                    className="focus:ring-0 h-4 w-4 text-neutral-900 border-yellow"
                    checked={selectAgents.includes(agent.name)}
                    onChange={() => {
                      if(selectAgents.includes(agent.name)){
                        setSelectAgents(selectAgents.filter(name => name != agent.name));
                      }
                      else{
                        setSelectAgents([...selectAgents, agent.name]);
                      }
                    }}
                  />
                  <SmallLabel>{agent.name}</SmallLabel>
                </div>
              ))
            }
            </div>
            <SmallLabel sx={{
              marginTop: '1rem',
            }}>Speaker Selection Mode</SmallLabel>
            <div className="flex items-start justify-start mt-2 space-x-5">
              {
                availableMode.map((mode, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2">
                    <input
                      id={mode}
                      name="mode"
                      type="checkbox"
                      className="focus:ring-0 h-4 w-4 text-neutral-900 border-yellow"
                      checked={speakerSelectionModel == mode}
                      onChange={() => setSpeakerSelectionModel(mode)}
                    />
                    <SmallLabel>{mode}</SmallLabel>
                  </div>
                ))
              }
            </div>
            <SmallLabel sx={{
              marginTop: '1rem',
            }}>Log Level</SmallLabel>
            <div className="flex items-start justify-start mt-2 space-x-5">
              {
                availableLogLevel.map((level, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2">
                    <input
                      id={level}
                      name="level"
                      type="checkbox"
                      className="focus:ring-0 h-4 w-4 text-neutral-900 border-yellow"
                      checked={logLevel == level}
                      onChange={() => setLogLevel(level)}
                    />
                    <SmallLabel>{level}</SmallLabel>
                  </div>
                ))
              }
            </div>
          </div>
          <div
            className="px-4 py-3 sm:px-6 flex justify-end sm:flex sm:flex-row">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border-0 border-transparent shadow-sm px-4 py-2 bg-neutral-500 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-500 text-base font-medium text-white hover:bg-neutral-800 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onSavedHandler}>
              Save
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border-0 shadow-sm px-4 py-2 bg-red-500 dark:bg-red-700  hover:bg-red-400 dark:hover:bg-red-500 text-base font-medium text-neutral-900 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>);
  };