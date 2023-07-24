import { IGroup } from '@/types/group';
import {useReducer} from 'react';

export type GroupCmd = "add" | "remove" | "update" | "addOrUpdate";
export type GroupAction = {type: GroupCmd, payload: IGroup, original?: IGroup};
export function groupReducer(groups : IGroup[], action: GroupAction){
    switch(action.type){
        case "add":
            if(groups.find(g => g.name === action.payload.name)){
                throw new Error("Group already exists");
            }
            return [...groups, action.payload];
        case "remove":
            return groups.filter(g => g.name !== action.payload.name);
        case "update":
            var originalName = action.original?.name ?? action.payload.name;
            return groups.map(g => g.name === originalName ? action.payload : g);
        case "addOrUpdate":
            var existing = groups.find(g => g.name === action.payload.name);
            if(existing){
                return groups.map(g => g.name === action.payload.name ? action.payload : g);
            }
            return [...groups, action.payload];
        default:
            throw new Error("Invalid group command");
    }
}