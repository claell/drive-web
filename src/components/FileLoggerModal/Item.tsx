import { FileActionTypes, FileStatusTypes } from '../../models/enums';
import { ILoggerFile } from '../../models/interfaces';
import iconService from '../../services/icon.service';
import { getItemFullName } from '../../services/storage.service/storage-name.service';

interface ItemProps {
  item: ILoggerFile
}

const Item = ({ item }: ItemProps): JSX.Element => {
  const statusClassName = item.status === 'success' || item.status === 'error' ? '' : 'opacity-50';
  const IconComponent = iconService.getItemIcon(item.isFolder, item.type || '');
  const fileMessagesByStatus = {
    [FileStatusTypes.Pending]: item.action === FileActionTypes.Download ? 'Pending to download' : 'Pending to upload',
    [FileStatusTypes.Uploading]: item.progress + '% Uploading file...',
    [FileStatusTypes.Downloading]: item.progress + '% Downloading file...',
    [FileStatusTypes.Success]: item.action === FileActionTypes.Download ? 'File downloaded' : 'File uploaded',
    [FileStatusTypes.Error]: item.action === FileActionTypes.Download ? 'Error during download' : 'Error during upload',
    [FileStatusTypes.Encrypting]: 'Encrypting file',
    [FileStatusTypes.Decrypting]: 'Decrypting file',
    [FileStatusTypes.CreatingDirectoryStructure]: 'Creating directory structure'
  };
  const folderMessagesByStatus = {
    [FileStatusTypes.Pending]: item.action === FileActionTypes.Download ? 'Pending to download' : 'Pending to upload',
    [FileStatusTypes.Uploading]: 'Uploading...',
    [FileStatusTypes.Downloading]: 'Downloading files in folder...',
    [FileStatusTypes.Success]: item.action === FileActionTypes.Download ? 'Folder downloaded' : 'Folder uploaded',
    [FileStatusTypes.Error]: item.action === FileActionTypes.Download ? 'Error during download' : 'Error during upload',
    [FileStatusTypes.Encrypting]: 'Encrypting files',
    [FileStatusTypes.Decrypting]: 'Decrypting files',
    [FileStatusTypes.CreatingDirectoryStructure]: 'Creating directory structure'
  };
  const name = getItemFullName(item.filePath.substr(item.filePath.lastIndexOf('/') + 1), item.type);
  const icon: JSX.Element = <IconComponent className='flex items-center justify-center mr-2.5 w-6' />;
  const message: string = item.isFolder ?
    folderMessagesByStatus[item.status] :
    fileMessagesByStatus[item.status];

  return (
    <div className={`${statusClassName} flex items-center px-4 mb-2.5`}>
      {icon}

      <div className='flex flex-col text-left w-40'>
        <span className='text-sm text-neutral-900 truncate'>
          {name}
        </span>

        <span className='text-xs text-neutral-500'>
          {message}
        </span>
      </div>
    </div>
  );
};

export default Item;