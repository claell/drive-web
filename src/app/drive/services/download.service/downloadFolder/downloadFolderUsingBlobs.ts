import { items } from '@internxt/lib';
import fileDownload from 'js-file-download';
import JSZip from 'jszip';

import { FolderTree } from '@internxt/sdk/dist/drive/storage/types';
import { DriveFolderData } from '../../../types';
import folderService from '../../folder.service';
import fetchFileBlob from '../fetchFileBlob';

/**
 * @description Downloads a folder keeping all file blobs in memory
 *
 * @param folderData
 * @param isTeam
 */
export default async function downloadFolderUsingBlobs({
  folder,
  decryptedCallback,
  updateProgressCallback,
  isWorkspace,
}: {
  folder: DriveFolderData;
  decryptedCallback?: () => void;
  updateProgressCallback?: (progress: number) => void;
  isWorkspace: boolean;
}): Promise<void> {
  const zip = new JSZip();
  const { tree, folderDecryptedNames, fileDecryptedNames, size } = await folderService.fetchFolderTree(folder.uuid);
  let downloadedSize = 0;
  console.log({ size });
  decryptedCallback?.();

  // * Renames files iterating over folders
  const pendingFolders: { parentFolder: JSZip | null; data: FolderTree }[] = [{ parentFolder: zip, data: tree }];
  while (pendingFolders.length > 0) {
    const currentFolder = pendingFolders[0];
    const currentFolderZip = currentFolder.parentFolder?.folder(folderDecryptedNames[currentFolder.data.id]) || null;
    const { files, folders } = {
      files: currentFolder.data.files,
      folders: currentFolder.data.children,
    };

    pendingFolders.shift();

    // * Downloads current folder files
    for (const file of files) {
      const displayFilename = items.getItemDisplayName({
        name: fileDecryptedNames[file.id],
        type: file.type,
      });

      const fileBlobPromise = fetchFileBlob(
        { ...file, bucketId: file.bucket },
        {
          updateProgressCallback: (fileProgress) => {
            const totalProgress = (downloadedSize + file.size * fileProgress) / size;

            (updateProgressCallback || (() => undefined))(totalProgress);
          },
          isWorkspace,
        },
      );
      const fileBlob = await fileBlobPromise;

      console.log('fileBlob', fileBlob);
      downloadedSize += parseInt(file.size.toString());
      console.log('downloadedSize', downloadedSize);

      currentFolderZip?.file(displayFilename, fileBlob);
    }
    console.log('currentFolderZip', currentFolderZip);
    // * Adds current folder folders to pending
    pendingFolders.push(
      ...folders.map((data) => ({
        parentFolder: currentFolderZip,
        data,
      })),
    );
  }
  console.log('before folderContent');
  const folderContent = await zip
    .generateAsync({ type: 'blob' }, (metadata) => {
      console.log('Progreso de compresión:', metadata.percent.toFixed(2) + '%');
    })
    .then((content) => {
      console.log('content', content);
      fileDownload(content, `${folder.name}.zip`, 'application/zip');
    });
  console.log('folderContent', folderContent);

  return folderContent;
}
