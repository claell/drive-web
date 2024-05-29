import { items } from '@internxt/lib';
import fileDownload from 'js-file-download';
import JSZip from 'jszip';

import { DriveFolderData, FolderTree } from '../../../types';
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
}: {
  folder: DriveFolderData;
  decryptedCallback?: () => void;
  updateProgressCallback?: (progress: number) => void;
}): Promise<void> {
  const zip = new JSZip();
  const { tree, folderDecryptedNames, fileDecryptedNames, size } = await folderService.fetchFolderTree(folder.id);
  let downloadedSize = 0;
  console.log({ tree });
  console.log({ folderDecryptedNames });
  console.log({ fileDecryptedNames });
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
    console.log('pendingFolders', pendingFolders);

    // * Downloads current folder files
    for (const file of files) {
      console.log('file', file.plainName);
      console.log('file', file.name);
      const displayFilename = items.getItemDisplayName({
        name: fileDecryptedNames[file.id],
        type: file.type,
      });
      console.log('displayFilename', displayFilename);
      if (!displayFilename.startsWith('.')) {
        const fileBlobPromise = fetchFileBlob(
          { ...file, bucketId: file.bucket },
          {
            updateProgressCallback: (fileProgress) => {
              const totalProgress = (downloadedSize + file.size * fileProgress) / size;
              console.log(totalProgress);
              (updateProgressCallback || (() => undefined))(totalProgress);
            },
          },
        );
        const fileBlob = await fileBlobPromise;
        console.log('fileBlob', fileBlob);
        downloadedSize += parseInt(file?.size?.toString() ?? '0');
        console.log({ downloadedSize });
        currentFolderZip?.file(displayFilename, fileBlob);
      }
    }
    console.log('currentFolderZip', currentFolderZip);
    // * Adds current folder folders to pending
    pendingFolders.push(
      ...folders.map((data) => ({
        parentFolder: currentFolderZip,
        data,
      })),
    );
    console.log('finished while');
  }
  console.log('pendingFolders', pendingFolders);

  // REVISAR SI ES EL TAMAÑO DEL BLOB LO QUE DA PROBLEMAS, Y APLICAR LA SOLUCION ALMACENANDO LOS BLOBS EN LA DB
  try {
    console.log('zip', zip);
    const folderContent = await zip.generateAsync({ type: 'blob' }).then((content) => {
      console.log('content', content);
      fileDownload(content, `${folder.name}.zip`, 'application/zip');
    });
    console.log('folderContent', folderContent);

    return folderContent;
  } catch (error) {
    console.log('error', error);
  }
}
