import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { items as itemUtils } from '@internxt/lib';
import { storageActions } from '..';
import { StorageState } from '../storage.model';
import { RootState } from '../../..';
import { planThunks } from '../../plan';
import { uiActions } from '../../ui';
import { renameFile } from 'app/crypto/services/utils';
import notificationsService, { ToastType } from 'app/notifications/services/notifications.service';
import { MAX_ALLOWED_UPLOAD_SIZE } from 'app/drive/services/network.service';
import { UserSettings } from '@internxt/sdk/dist/shared/types/userSettings';
import { DriveFileData, DriveItemData } from 'app/drive/types';
import { FileToUpload } from 'app/drive/services/file.service/uploadFile';
import { SdkFactory } from '../../../../core/factory/sdk';
import { t } from 'i18next';
import { uploadFileWithManager } from '../../../../network/UploadManager';
import shareService from '../../../../share/services/share.service';
import { SharedFiles } from '@internxt/sdk/dist/drive/share/types';

interface UploadItemsThunkOptions {
  relatedTaskId: string;
  showNotifications: boolean;
  showErrors: boolean;
  abortController?: AbortController;
  onSuccess: () => void;
}

interface UploadItemsPayload {
  files: File[];
  parentFolderId: number;
  options?: Partial<UploadItemsThunkOptions>;
  filesProgress?: { filesUploaded: number; totalFilesToUpload: number };
}

const DEFAULT_OPTIONS: Partial<UploadItemsThunkOptions> = { showNotifications: true, showErrors: true };

const showEmptyFilesNotification = (zeroLengthFilesNumber: number) => {
  if (zeroLengthFilesNumber > 0) {
    const fileText = zeroLengthFilesNumber === 1 ? 'file' : 'files';

    notificationsService.show({
      text: `Empty files are not supported.\n${zeroLengthFilesNumber} empty ${fileText} not uploaded.`,
      type: ToastType.Warning,
    });
  }
};

/**
 * @description
 *  1. Prepare files to upload
 *  2. Schedule tasks
 */
export const uploadItemsThunk = createAsyncThunk<void, UploadItemsPayload, { state: RootState }>(
  'storage/uploadItems',
  async ({ files, parentFolderId, options }: UploadItemsPayload, { getState, dispatch }) => {
    const user = getState().user.user as UserSettings;
    const showSizeWarning = files.some((file) => file.size > MAX_ALLOWED_UPLOAD_SIZE);
    const filesToUpload: FileToUpload[] = [];
    const errors: Error[] = [];

    options = Object.assign(DEFAULT_OPTIONS, options || {});

    try {
      const planLimit = getState().plan.planLimit;
      const planUsage = getState().plan.planUsage;
      const uploadItemsSize = Object.values(files).reduce((acum, file) => acum + file.size, 0);
      const totalItemsSize = uploadItemsSize + planUsage;

      if (planLimit && totalItemsSize >= planLimit) {
        dispatch(uiActions.setIsReachedPlanLimitDialogOpen(true));
        return;
      }
    } catch (err: unknown) {
      console.error(err);
    }

    if (showSizeWarning) {
      notificationsService.show({
        text: t('error.maxSizeUploadLimitError'),
        type: ToastType.Warning,
      });
      return;
    }

    const storageClient = SdkFactory.getInstance().createStorageClient();

    let zeroLengthFilesNumber = 0;
    for (const file of files) {
      if (file.size === 0) {
        zeroLengthFilesNumber = zeroLengthFilesNumber + 1;
        continue;
      }
      const { filename, extension } = itemUtils.getFilenameAndExt(file.name);
      const [parentFolderContentPromise] = storageClient.getFolderContent(parentFolderId);

      const parentFolderContent = await parentFolderContentPromise;
      const [, , finalFilename] = itemUtils.renameIfNeeded(parentFolderContent.files, filename, extension);
      const fileContent = renameFile(file, finalFilename);

      filesToUpload.push({
        name: finalFilename,
        size: file.size,
        type: extension,
        content: fileContent,
        parentFolderId,
      });
    }
    showEmptyFilesNotification(zeroLengthFilesNumber);

    const filesToUploadData = filesToUpload.map((file) => ({
      filecontent: file,
      userEmail: user.email,
      parentFolderId,
      onFinishUploadFile: (driveItemData: DriveFileData) => {
        dispatch(
          storageActions.pushItems({
            updateRecents: true,
            folderIds: [parentFolderId],
            items: [driveItemData as DriveItemData],
          }),
        );
      },
      abortController: new AbortController(),
    }));

    const openMaxSpaceOccupiedDialog = () => dispatch(uiActions.setIsReachedPlanLimitDialogOpen(true));
    await uploadFileWithManager(filesToUploadData, openMaxSpaceOccupiedDialog);

    options.onSuccess?.();

    setTimeout(() => {
      dispatch(planThunks.fetchUsageThunk());
    }, 1000);

    if (errors.length > 0) {
      for (const error of errors) {
        notificationsService.show({ text: error.message, type: ToastType.Error });
      }

      throw new Error(t('error.uploadingItems') as string);
    }
  },
);

interface UploadSharedItemsPayload {
  files: File[];
  parentFolderId: number;
  options?: Partial<UploadItemsThunkOptions>;
  filesProgress?: { filesUploaded: number; totalFilesToUpload: number };
  currentFolderId: string;
  ownerUserAuthenticationData?: {
    token: string;
    bridgeUser: string;
    bridgePass: string;
    encryptionKey: string;
    bucketId: string;
  };
  isDeepFolder: boolean;
}
/**
 * @description
 *  1. Prepare files to upload
 *  2. Schedule tasks
 */
export const uploadSharedItemsThunk = createAsyncThunk<void, UploadSharedItemsPayload, { state: RootState }>(
  'storage/uploadItems',
  async (
    {
      files,
      parentFolderId,
      options,
      ownerUserAuthenticationData,
      currentFolderId,
      isDeepFolder,
    }: UploadSharedItemsPayload,
    { getState, dispatch },
  ) => {
    const user = getState().user.user as UserSettings;
    const showSizeWarning = files.some((file) => file.size > MAX_ALLOWED_UPLOAD_SIZE);
    const filesToUpload: FileToUpload[] = [];
    const errors: Error[] = [];

    options = Object.assign(DEFAULT_OPTIONS, options || {});

    try {
      const planLimit = getState().plan.planLimit;
      const planUsage = getState().plan.planUsage;
      const uploadItemsSize = Object.values(files).reduce((acum, file) => acum + file.size, 0);
      const totalItemsSize = uploadItemsSize + planUsage;

      if (planLimit && totalItemsSize >= planLimit) {
        dispatch(uiActions.setIsReachedPlanLimitDialogOpen(true));
        return;
      }
    } catch (err: unknown) {
      console.error(err);
    }

    if (showSizeWarning) {
      notificationsService.show({
        text: t('error.maxSizeUploadLimitError'),
        type: ToastType.Warning,
      });
      return;
    }

    let zeroLengthFilesNumber = 0;
    for (const file of files) {
      if (file.size === 0) {
        zeroLengthFilesNumber = zeroLengthFilesNumber + 1;
        continue;
      }
      const { filename, extension } = itemUtils.getFilenameAndExt(file.name);

      let page = 0;
      const offset = 50;
      let allItems: SharedFiles[] = [];

      let hasMoreItems = true;

      while (hasMoreItems) {
        const parentFolderContent = await shareService.getSharedFolderContent(
          currentFolderId,
          'files',
          isDeepFolder ? ownerUserAuthenticationData?.token ?? '' : '',
          page,
          offset,
        );
        const parentFolderFiles = parentFolderContent.items;

        if (parentFolderFiles.length === 0 || parentFolderFiles.length < offset) hasMoreItems = false;

        allItems = allItems.concat(parentFolderFiles as SharedFiles[]);
        page++;
      }

      const [, , finalFilename] = itemUtils.renameIfNeeded(
        allItems.map((item) => ({ ...item, name: item.plainName })),
        filename,
        extension,
      );
      const fileContent = renameFile(file, finalFilename);

      filesToUpload.push({
        name: finalFilename,
        size: file.size,
        type: extension,
        content: fileContent,
        parentFolderId,
      });
    }
    showEmptyFilesNotification(zeroLengthFilesNumber);

    const filesToUploadData = filesToUpload.map((file) => ({
      filecontent: file,
      userEmail: user.email,
      parentFolderId,
      onFinishUploadFile: (driveItemData: DriveFileData) => {
        dispatch(
          storageActions.pushItems({
            updateRecents: true,
            folderIds: [parentFolderId],
            items: [driveItemData as DriveItemData],
          }),
        );
      },
      abortController: new AbortController(),
    }));

    const openMaxSpaceOccupiedDialog = () => dispatch(uiActions.setIsReachedPlanLimitDialogOpen(true));
    await uploadFileWithManager(filesToUploadData, openMaxSpaceOccupiedDialog, undefined, {
      ownerUserAuthenticationData,
    });

    options.onSuccess?.();

    setTimeout(() => {
      dispatch(planThunks.fetchUsageThunk());
    }, 1000);

    if (errors.length > 0) {
      for (const error of errors) {
        notificationsService.show({ text: error.message, type: ToastType.Error });
      }

      throw new Error(t('error.uploadingItems') as string);
    }
  },
);

export const uploadItemsThunkNoCheck = createAsyncThunk<void, UploadItemsPayload, { state: RootState }>(
  'storage/uploadItems',
  async ({ files, parentFolderId, options }: UploadItemsPayload, { getState, dispatch }) => {
    const user = getState().user.user as UserSettings;
    const showSizeWarning = files.some((file) => file.size > MAX_ALLOWED_UPLOAD_SIZE);
    const filesToUpload: FileToUpload[] = [];
    const errors: Error[] = [];

    options = Object.assign(DEFAULT_OPTIONS, options || {});

    try {
      const planLimit = getState().plan.planLimit;
      const planUsage = getState().plan.planUsage;
      const uploadItemsSize = Object.values(files).reduce((acum, file) => acum + file.size, 0);
      const totalItemsSize = uploadItemsSize + planUsage;

      if (planLimit && totalItemsSize >= planLimit) {
        dispatch(uiActions.setIsReachedPlanLimitDialogOpen(true));
        return;
      }
    } catch (err: unknown) {
      console.error(err);
    }

    if (showSizeWarning) {
      notificationsService.show({
        text: t('error.maxSizeUploadLimitError'),
        type: ToastType.Warning,
      });
      return;
    }

    let zeroLengthFilesNumber = 0;
    for (const file of files) {
      if (file.size === 0) {
        zeroLengthFilesNumber = zeroLengthFilesNumber + 1;
        continue;
      }
      const { filename, extension } = itemUtils.getFilenameAndExt(file.name);
      const fileContent = renameFile(file, filename);

      filesToUpload.push({
        name: filename,
        size: file.size,
        type: extension,
        content: fileContent,
        parentFolderId,
      });
    }
    showEmptyFilesNotification(zeroLengthFilesNumber);

    const filesToUploadData = filesToUpload.map((file) => ({
      filecontent: file,
      userEmail: user.email,
      parentFolderId,
      onFinishUploadFile: (driveItemData: DriveFileData) => {
        dispatch(
          storageActions.pushItems({
            updateRecents: true,
            folderIds: [parentFolderId],
            items: [driveItemData as DriveItemData],
          }),
        );
      },
      abortController: new AbortController(),
    }));

    const openMaxSpaceOccupiedDialog = () => dispatch(uiActions.setIsReachedPlanLimitDialogOpen(true));
    await uploadFileWithManager(filesToUploadData, openMaxSpaceOccupiedDialog);

    options.onSuccess?.();

    setTimeout(() => {
      dispatch(planThunks.fetchUsageThunk());
    }, 1000);

    if (errors.length > 0) {
      for (const error of errors) {
        notificationsService.show({ text: error.message, type: ToastType.Error });
      }
      throw new Error(t('error.uploadingItems') as string);
    }
  },
);

/**
 * @description
 *  1. Prepare files to upload
 *  2. Schedule tasks
 */
export const uploadItemsParallelThunk = createAsyncThunk<void, UploadItemsPayload, { state: RootState }>(
  'storage/uploadItems',
  async ({ files, parentFolderId, options, filesProgress }: UploadItemsPayload, { getState, dispatch }) => {
    const user = getState().user.user as UserSettings;
    const showSizeWarning = files.some((file) => file.size > MAX_ALLOWED_UPLOAD_SIZE);
    const filesToUpload: FileToUpload[] = [];
    const errors: Error[] = [];

    options = Object.assign(DEFAULT_OPTIONS, options || {});

    try {
      const planLimit = getState().plan.planLimit;
      const planUsage = getState().plan.planUsage;
      const uploadItemsSize = Object.values(files).reduce((acum, file) => acum + file.size, 0);
      const totalItemsSize = uploadItemsSize + planUsage;

      if (planLimit && totalItemsSize >= planLimit) {
        dispatch(uiActions.setIsReachedPlanLimitDialogOpen(true));
        return;
      }
    } catch (err: unknown) {
      console.error(err);
    }

    if (showSizeWarning) {
      notificationsService.show({
        text: t('error.maxSizeUploadLimitError'),
        type: ToastType.Warning,
      });
      return;
    }

    const storageClient = SdkFactory.getInstance().createStorageClient();
    const [parentFolderContentPromise] = storageClient.getFolderContent(parentFolderId);
    const parentFolderContent = await parentFolderContentPromise;

    let zeroLengthFilesNumber = 0;
    for (const file of files) {
      if (file.size === 0) {
        zeroLengthFilesNumber = zeroLengthFilesNumber + 1;
        continue;
      }
      const { filename, extension } = itemUtils.getFilenameAndExt(file.name);

      const [, , finalFilename] = itemUtils.renameIfNeeded(parentFolderContent.files, filename, extension);
      const fileContent = renameFile(file, finalFilename);

      filesToUpload.push({
        name: finalFilename,
        size: file.size,
        type: extension,
        content: fileContent,
        parentFolderId,
      });
    }
    showEmptyFilesNotification(zeroLengthFilesNumber);

    const abortController = options?.abortController || new AbortController();

    const filesToUploadData = filesToUpload.map((file) => ({
      filecontent: file,
      userEmail: user.email,
      parentFolderId,
    }));

    const openMaxSpaceOccupiedDialog = () => dispatch(uiActions.setIsReachedPlanLimitDialogOpen(true));
    await uploadFileWithManager(filesToUploadData, openMaxSpaceOccupiedDialog, abortController, options, filesProgress);

    options.onSuccess?.();

    if (errors.length > 0) {
      for (const error of errors) {
        notificationsService.show({ text: error.message, type: ToastType.Error });
      }

      throw new Error(t('error.uploadingItems') as string);
    }
  },
);

export const uploadItemsParallelThunkNoCheck = createAsyncThunk<void, UploadItemsPayload, { state: RootState }>(
  'storage/uploadItems',
  async ({ files, parentFolderId, options, filesProgress }: UploadItemsPayload, { getState, dispatch }) => {
    const user = getState().user.user as UserSettings;
    const showSizeWarning = files.some((file) => file.size > MAX_ALLOWED_UPLOAD_SIZE);
    const filesToUpload: FileToUpload[] = [];
    const errors: Error[] = [];

    const abortController = options?.abortController || new AbortController();

    options = Object.assign(DEFAULT_OPTIONS, options || {});

    try {
      const planLimit = getState().plan.planLimit;
      const planUsage = getState().plan.planUsage;
      const uploadItemsSize = Object.values(files).reduce((acum, file) => acum + file.size, 0);
      const totalItemsSize = uploadItemsSize + planUsage;

      if (planLimit && totalItemsSize >= planLimit) {
        dispatch(uiActions.setIsReachedPlanLimitDialogOpen(true));
        return;
      }
    } catch (err: unknown) {
      console.error(err);
    }

    if (showSizeWarning) {
      notificationsService.show({
        text: t('error.maxSizeUploadLimitError'),
        type: ToastType.Warning,
      });
      return;
    }

    let zeroLengthFilesNumber = 0;
    for (const file of files) {
      if (file.size === 0) {
        zeroLengthFilesNumber = zeroLengthFilesNumber + 1;
        continue;
      }
      const { filename, extension } = itemUtils.getFilenameAndExt(file.name);
      const fileContent = renameFile(file, filename);

      filesToUpload.push({
        name: filename,
        size: file.size,
        type: extension,
        content: fileContent,
        parentFolderId,
      });
    }
    showEmptyFilesNotification(zeroLengthFilesNumber);

    const filesToUploadData = filesToUpload.map((file) => ({
      filecontent: file,
      userEmail: user.email,
      parentFolderId,
    }));

    const openMaxSpaceOccupiedDialog = () => dispatch(uiActions.setIsReachedPlanLimitDialogOpen(true));
    await uploadFileWithManager(filesToUploadData, openMaxSpaceOccupiedDialog, abortController, options, filesProgress);

    options.showNotifications = true;
    options.onSuccess?.();

    if (errors.length > 0) {
      for (const error of errors) {
        notificationsService.show({ text: error.message, type: ToastType.Error });
      }

      throw new Error(t('error.uploadingItems') as string);
    }
  },
);

export const uploadItemsThunkExtraReducers = (builder: ActionReducerMapBuilder<StorageState>): void => {
  builder
    .addCase(uploadItemsThunk.pending, () => undefined)
    .addCase(uploadItemsThunk.fulfilled, () => undefined)
    .addCase(uploadItemsThunk.rejected, (state, action) => {
      const requestOptions = Object.assign(DEFAULT_OPTIONS, action.meta.arg.options || {});
      if (requestOptions?.showErrors) {
        notificationsService.show({
          text: t('error.uploadingFile', { reason: action.error.message || '' }),
          type: ToastType.Error,
        });
      }
    });
};
