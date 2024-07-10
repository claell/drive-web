import { ShareLink } from '@internxt/sdk/dist/drive/share/types';
import { AdvancedSharedItem } from 'app/share/types';
import { SVGProps } from 'react';

export interface DriveFolderData {
  id: number;
  bucket: string | null;
  color: string | null;
  createdAt: string;
  deleted: boolean;
  encrypt_version: string | null;
  icon: string | null;
  iconId: number | null;
  icon_id: number | null;
  isFolder: boolean;
  name: string;
  plain_name: string;
  plainName?: string | null;
  parentId: number;
  parentUuid: string;
  parent_id: number | null;
  updatedAt: string;
  userId: number;
  user_id: number;
  shares?: Array<ShareLink>;
  sharings?: { type: string; id: string }[];
  uuid: string;
}

export interface DriveFolderMetadataPayload {
  itemName: string;
  color?: string;
  icon?: string;
}

export interface DriveFileData {
  bucket: string;
  createdAt: string;
  created_at: string;
  deleted: boolean;
  deletedAt: null;
  encrypt_version: string;
  fileId: string;
  folderId: number;
  folder_id: number;
  folderUuid: string;
  id: number;
  name: string;
  plain_name: string | null;
  plainName?: string | null;
  size: number;
  type: string;
  updatedAt: string;
  status: string;
  thumbnails: Array<Thumbnail>;
  currentThumbnail: Thumbnail | null;
  shares?: Array<ShareLink>;
  sharings?: { type: string; id: string }[];
  uuid: string;
}

interface Thumbnail {
  id: number;
  file_id: number;
  type: string;
  max_width: number;
  max_height: number;
  size: number;
  bucket_id: string;
  bucket_file: string;
  encrypt_version: string;
  urlObject?: string;
}

export enum ThumbnailConfig {
  MaxWidth = 300,
  MaxHeight = 300,
  Quality = 100,
  Type = 'png',
}

export interface DriveFileMetadataPayload {
  itemName: string;
}

export type DriveItemData = DriveFileData & DriveFolderData;

export interface DriveItemPatch {
  name?: string;
  plain_name?: string;
  plainName?: string;
  currentThumbnail?: Thumbnail;
  thumbnails?: Thumbnail[];
  shares?: ShareLink[];
}

export interface FileInfoMenuItem {
  id: string;
  icon: React.FunctionComponent<SVGProps<SVGSVGElement>>;
  title: string;
  features: { label: string; value: string }[];
}

export interface FolderTree {
  id: number;
  bucket: string | null;
  children: FolderTree[];
  encrypt_version: string;
  files: DriveFileData[];
  name: string;
  parentId: number;
  parent_id: number;
  userId: number;
  user_id: number;
  createdAt: string;
  updatedAt: string;
}

export interface FolderPath {
  name: string;
  uuid: string;
}

export interface FolderPathDialog {
  name: string;
  uuid: string;
}

export enum FileViewMode {
  List = 'list',
  Grid = 'grid',
}

export enum DownloadFolderMethod {
  FileSystemAccessAPI = 'file-system-access-api',
  StreamSaver = 'stream-saver',
}

export enum FreeStoragePlan {
  simpleName = '2GB',
  storageLimit = 2147483648,
}

export type DriveItemDetails = (DriveItemData | AdvancedSharedItem) & {
  isShared: boolean;
  userEmail?: string;
  view: 'Drive' | 'Shared';
};

export type ItemDetailsProps = {
  name: string;
  uploadedBy: string;
  location: string;
  uploaded: string;
  modified: string;
  shared: string;
  type?: string;
  size?: string;
};
