import { Component } from 'react';
import { match } from 'react-router';
import 'react-toastify/dist/ReactToastify.css';
import UilCheck from '@iconscout/react-unicons/icons/uil-check';
import {
  getSharedDirectoryFiles,
  getSharedDirectoryFolders,
  getSharedFolderInfo
} from 'app/share/services/share.service';
import { ReactComponent as Spinner } from 'assets/icons/spinner.svg';
import { ReactComponent as Logo } from 'assets/icons/big-logo.svg';
import iconService from 'app/drive/services/icon.service';
import BaseButton from 'app/shared/components/forms/BaseButton';
import { TaskProgress } from 'app/tasks/types';
import i18n from 'app/i18n/services/i18n.service';
import JSZip from 'jszip';

import './ShareView.scss';
import { ShareTypes } from '@internxt/sdk/dist/drive';
import sizeService from '../../../drive/services/size.service';
import { IDownloadParams, Network } from '../../../drive/services/network';
import fileDownload from 'js-file-download';
import internal from 'stream';
import { SharedDirectoryFile } from '../../../../../../sdk/dist/drive/share/types';
import streamSaver from 'streamsaver';

export interface ShareViewProps {
  match: match<{
    token: string,
    code: string,
  }>;
}

interface FolderPackage {
  folderId: number
  pack: JSZip
}

interface ShareViewState {
  token: string
  error: string | null
  progress: number
  ready: boolean
  info: ShareTypes.SharedFolderInfo
  completedFolders: FolderPackage[]
  rootPackage: JSZip
}

class ShareFolderView extends Component<ShareViewProps, ShareViewState> {
  state = {
    token: this.props.match.params.token,
    code: this.props.match.params.code,
    error: null,
    progress: TaskProgress.Min,
    ready: false,
    info: {
      folderId: 0,
      name: '',
      size: 0,
      bucket: '',
      bucketToken: ''
    },
    completedFolders: [],
    rootPackage: new JSZip()
  };

  componentDidMount(): void {
    this.loadFolderInfo()
      .then(() => {
        this.setState({
          ready: true
        });
      })
      .catch(error => {
        this.setState({
          error: error.message
        });
      });
  }

  updateProgress = (progress) => {
    this.setState({
      progress: Math.max(TaskProgress.Min, progress * 100)
    });
  }

  /**
   * Fetches general info and directory folders structure
   */
  loadFolderInfo = async () => {
    if (navigator.userAgent.match('CriOS')) {
      // ! iOS Chrome is not supported
      throw new Error('Chrome iOS not supported. Use Safari to proceed');
    }

    let rootFolderId;
    try {
      // Load general info
      const folderInfo = await getSharedFolderInfo(this.state.token);
      rootFolderId = folderInfo.folderId;
      this.setState({
        info: {
          folderId: rootFolderId,
          name: folderInfo.name,
          size: folderInfo.size,
          bucket: folderInfo.bucket,
          bucketToken: folderInfo.bucketToken,
        },
      });
    } catch (err) {
      throw new Error(i18n.get('error.linkExpired'));
    }

    const foldersLimitPerRequest = 10;
    let currentOffset = 0;

    const pendingFolders: FolderPackage[] = [{
      folderId: rootFolderId,
      pack: this.state.rootPackage
    }];
    const completedFolders: FolderPackage[] = [];

    while (pendingFolders.length) {
      const { folderId, pack } = (pendingFolders.shift() as FolderPackage);
      let completed = false;
      while (!completed) {
        const payload: ShareTypes.GetSharedDirectoryFoldersPayload = {
          token: this.state.token,
          directoryId: folderId,
          offset: currentOffset,
          limit: foldersLimitPerRequest,
        };
        const foldersResponse = await getSharedDirectoryFolders(payload);
        foldersResponse.folders.map(folder => {
          pendingFolders.push({
            folderId: folder.id,
            pack: pack.folder(folder.name)
          });
        });
        completed = foldersResponse.last;
        currentOffset += foldersLimitPerRequest;
      }
      completedFolders.push({ folderId, pack });
    }

    this.setState({
      completedFolders: completedFolders
    });
  }

  isFileSystemApiAvailable = (): boolean => {
    return ('showSaveFilePicker' in window);
  }

  /**
   * Triggered when user starts the shared folder download
   * Decides if download should happen using streams or BLOBs
   */
  download = async (): Promise<void> => {
    if (this.isFileSystemApiAvailable()) {
      await this.downloadWithStreams();
    } else {
      await this.downloadWithBlobs();
    }
  };

  /**
   * Launches the download logic configuring the packaging to use BLOBs
   */
  downloadWithBlobs = async (): Promise<void> => {
    await this.downloadDirectory(
      async (
        network: Network,
        pack: JSZip,
        file: SharedDirectoryFile,
        params: IDownloadParams
      ) => {
        const [fileBlobPromise] = network.downloadFile(
          this.state.info.bucket,
          file.id,
          params
        );
        const fileBlob = await fileBlobPromise;
        pack.file(`${file.name}.${file.type}`, fileBlob);
      },
      async () => {
        await this.state.rootPackage.generateAsync({ type: 'blob' }).then((content) => {
          fileDownload(content, `${this.state.info.name}.zip`, 'application/zip');
        });
      }
    );
  };

  /**
   * Launches the download logic configuring the packaging to use streams
   */
  downloadWithStreams = async (): Promise<void> => {
    await this.downloadDirectory(
      async (
        network: Network,
        pack: JSZip,
        file: SharedDirectoryFile,
        params: IDownloadParams
      ) => {
        const [fileStreamPromise] = network.getFileDownloadStream(
          this.state.info.bucket,
          file.id,
          params
        );
        const fileStream = await fileStreamPromise;
        pack.file(`${file.name}.${file.type}`, fileStream, { compression: 'DEFLATE' });
      },
      async () => {

        const writableStream = streamSaver.createWriteStream(`${this.state.info.name}.zip`, {});
        const writer = writableStream.getWriter();

        const downloadPromise = new Promise<void>((resolve, reject) => {
          const folderStream = this.state.rootPackage.generateInternalStream({
            type: 'uint8array',
            streamFiles: true,
            compression: 'DEFLATE',
          }) as internal.Readable;
          folderStream
            ?.on('data', (chunk: Buffer) => {
              console.log('write');
              writer.write(chunk);
            })
            .on('error', (err) => {
              console.log('error');
              reject(err);
            })
            .on('end', () => {
              console.log('end');
              writer.close();
              window.removeEventListener('unload', writer.abort);
              resolve();
            });

          folderStream.resume();
        });

        await downloadPromise;
      }
    );
  };

  /**
   * Performs the common logic of fetching files details and downloading data from network
   * @param downloadFile
   * @param packFiles
   */
  downloadDirectory = async (
    downloadFile: (
      network: Network,
      pack: JSZip,
      file: SharedDirectoryFile,
      params: IDownloadParams
    ) => Promise<void>,
    packFiles: () => Promise<void>,
  ) => {
    const network = new Network('NONE', 'NONE', 'NONE');
    const downloadingSize: Record<number, number> = {};
    const filesLimitPerRequest = 10;

    const pendingFolders = this.state.completedFolders as FolderPackage[];

    while (pendingFolders.length) {
      /** For each folder */
      const { folderId, pack } = pendingFolders.shift() as FolderPackage;
      let currentOffset = 0;
      let completed = false;

      while (!completed) {
        /** Until we have all files from folder */
        const payload: ShareTypes.GetSharedDirectoryFilesPayload = {
          token: this.state.token,
          code: this.state.code,
          directoryId: folderId,
          offset: currentOffset,
          limit: filesLimitPerRequest,
        };
        const filesResponse = await getSharedDirectoryFiles(payload);

        for (const file of filesResponse.files) {
          /** Download file data from network */
          await downloadFile(network, pack, file, {
            fileEncryptionKey: Buffer.from(file.encryptionKey, 'hex'),
            fileToken: this.state.info.bucketToken,
            progressCallback: (fileProgress) => {
              downloadingSize[file.id] = file.size * fileProgress;
              const totalDownloadedSize = Object.values(downloadingSize).reduce((t, x) => t + x, 0);
              const totalProgress = totalDownloadedSize / this.state.info.size;
              this.updateProgress(totalProgress);
            },
          });
        }

        completed = filesResponse.last;
        currentOffset += filesLimitPerRequest;
      }
    }

    await packFiles();
  };

  render(): JSX.Element {
    if (this.state.error) {
      return this.renderBody(<p className="text-lg text-red-70">{this.state.error}</p>);
    }

    if (!this.state.ready) {
      return this.renderBody(<Spinner className="fill-current animate-spin h-16 w-16" />);
    }

    const ItemIconComponent = iconService.getItemIcon(true);

    const DownloadButton = (
      <BaseButton onClick={this.download} className="primary font-bold p-5">
        {i18n.get('actions.download')}
      </BaseButton>
    );

    return this.renderBody(
      <div
        className="bg-white w-full mx-5 md:w-1/2 xl:w-1/4 border\
           border-solid rounded border-l-neutral-50 flex flex-col items-center justify-center py-8"
        style={{ minHeight: '40%' }}
      >
        <div className="flex items-center max-w-full px-4">
          <ItemIconComponent className="mr-5"></ItemIconComponent>{' '}
          <h1 className="text-2xl overflow-ellipsis overflow-hidden whitespace-nowrap max-w-full">
            {this.state.info.name}
          </h1>
        </div>
        <p className="text-l-neutral-50 text-sm mt-1">{sizeService.bytesToString(this.state.info?.size)}</p>
        <div className="h-12 mt-5">
          {
            this.state.progress
              ? ProgressComponent(this.state.progress)
              : DownloadButton}
        </div>
      </div>
    );
  }

  renderBody = (body): JSX.Element => {
    return <div className="flex justify-center items-center h-screen bg-gray-10 relative">
      <Logo className="absolute top-5 left-5 h-auto w-32"></Logo>
      {body}
    </div>;
  }
}

function ProgressComponent(progress) {
  const progressBarPixelsTotal = 100;
  const progressBarPixelsCurrent = (progress * progressBarPixelsTotal) / 100;
  return progress < 100
    ?
    <div style={{ width: `${progressBarPixelsTotal}px` }} className="bg-l-neutral-20">
      <div
        style={{ width: `${progressBarPixelsCurrent}px` }}
        className="border-t-8 rounded border-l-neutral-50 transition-width duration-1000"
      ></div>
    </div>
    :
    <UilCheck className="text-green-50" height="40" width="40"></UilCheck>;
}

export default ShareFolderView;
