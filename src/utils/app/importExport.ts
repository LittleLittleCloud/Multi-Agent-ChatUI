import { Folder } from '@/types/folder';
import { IStorage, exportZip } from '@/types/storage';

function currentDate() {
  const date = new Date();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  return `${month}-${day}`;
}

export const exportData = async (storage: IStorage) => {
  const blob = await exportZip(storage);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `chatbot_ui_storage_${currentDate()}.chat`;
  link.href = url;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
