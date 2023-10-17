import { IGroupRecord } from '@/types/group';
import JSZip from 'jszip';
import { ChatBlobStorage, ImageBlobStorage } from '@/utils/blobStorage';
import { IAgent, IAgentRecord } from '@/agent/type';

export interface IUISettings extends IRecord{
}

export type availableValueTypes = string | number | boolean | Blob | undefined | IRecord;
export interface IRecord{
  type: string;
}

export interface IStorageRecord extends IRecord{
  agents: IAgentRecord[];
  groups: IGroupRecord[];
}

export function saveStorage(storage: IStorageRecord){
  localStorage.setItem('storage', JSON.stringify(storage));
}

export function loadStorage(): IStorageRecord{
  var storage = localStorage.getItem('storage');
  if(storage){
    return JSON.parse(storage);
  }
  return {
    type: "storage",
    agents: [],
    groups: []
  };
}

export async function exportZip(storage: IStorageRecord): Promise<Blob>{
  var zip = new JSZip();
  zip.file("storage.json", JSON.stringify(storage));

  // save images to images folder
  var imgs = zip.folder("images");
  var imageStorage = await ImageBlobStorage;
  var images = await imageStorage.listBlobs();
  for(var image of images){
    var blob = await imageStorage.getBlob(image);
    imgs!.file(image, blob);
  }

  // save chats to chat folder
  var chatBlobs = await ChatBlobStorage;
  var chats = await chatBlobs.listBlobs();
  var chatBlobsFolder = zip.folder("chat");
  for(var chat of chats){
    var blob = await chatBlobs.getBlob(chat);
    chatBlobsFolder!.file(chat, blob);
  }

  return await zip.generateAsync({type:"blob"});
}

export async function importZip(blob: Blob): Promise<IStorageRecord>{
  var zip = await JSZip.loadAsync(blob);
  var storage = await zip.file("storage.json")!.async("string");
  var imageStorage = await ImageBlobStorage;
  zip.folder("images")?.forEach(async (relativePath, file) => {
    var blob = await file.async("blob");
    await imageStorage.saveBlob(blob, relativePath);
  });

  var chatBlobs = await ChatBlobStorage;
  zip.folder("chat")?.forEach(async (relativePath, file) => {
    var blob = await file.async("blob");
    await chatBlobs.saveBlob(blob, relativePath);
  });

  return JSON.parse(storage);
}