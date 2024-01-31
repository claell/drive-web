import { useState } from 'react';
import { useRetryDownload, useRetryUpload } from '../../hooks/useRetry';

import tasksService from '../../services/tasks.service';
import { TaskNotification, TaskStatus, TaskType } from '../../types';
import { TaskLoggerActions } from '../TaskLoggerActions/TaskLoggerActions';
import notificationsService, { ToastType } from '../../../notifications/services/notifications.service';
import { t } from 'i18next';
import { useReduxActions } from '../../../store/slices/storage/hooks/useReduxActions';

interface TaskLoggerItemProps {
  notification: TaskNotification;
}

const taskStatusTextColors = {
  [TaskStatus.Error]: 'text-red',
  [TaskStatus.Success]: 'text-gray-50',
  [TaskStatus.Cancelled]: 'text-gray-50',
};

const ProgressBar = ({ progress, isPaused }) => {
  return (
    <div
      className={`absolute bottom-0 left-0 ${isPaused ? 'bg-gray-50' : 'bg-primary'} `}
      style={{ height: '2px', width: `${progress}%` }}
    />
  );
};

const TaskLoggerItem = ({ notification }: TaskLoggerItemProps): JSX.Element => {
  const [isHovered, setIsHovered] = useState(false);

  const { downloadItemsAsZip, downloadItems, uploadFolder, uploadItem } = useReduxActions();
  const { retryDownload } = useRetryDownload({
    notification,
    downloadItemsAsZip,
    downloadItems,
  });
  const { retryUpload } = useRetryUpload({
    notification,
    uploadFolder,
    uploadItem,
    showErrorNotification() {
      notificationsService.show({ text: t('tasks.generalErrorMessages.retryUploadFailed'), type: ToastType.Error });
    },
  });

  const progressInPercentage = notification.progress ? (notification.progress * 100).toFixed(0) : 0;
  const notExistProgress = notification.progress && notification.progress === Infinity;
  const progress = notExistProgress ? '-' : progressInPercentage;

  const showProgressBar = notification.status === TaskStatus.InProcess || notification.status === TaskStatus.Paused;
  const isUploadTask = notification.action.includes('upload');

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const isDownloadError =
    [TaskStatus.Error, TaskStatus.Cancelled].includes(notification.status) &&
    (notification.action === TaskType.DownloadFile || notification.action === TaskType.DownloadFolder);

  const getRetryActionFunction = (isDownload: boolean) => {
    return isDownload ? retryDownload : retryUpload;
  };

  const retryFunction = getRetryActionFunction(isDownloadError);

  const messageClassName = taskStatusTextColors[notification.status] ?? 'text-primary';

  const onCancelButtonClicked = () => {
    tasksService.cancelTask(notification.taskId);
    tasksService.removeTask(notification.taskId);
  };

  return (
    <div className="relative">
      <div
        className={'flex h-12 items-center space-x-2 px-2 hover:bg-gray-5'}
        role="none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <notification.icon className="h-8 w-8 drop-shadow-sm" />
        <div className="flex flex-1 flex-col overflow-hidden text-left">
          <span className="truncate text-sm font-medium text-gray-80" title={notification.title}>
            {notification.title}
          </span>
          <span className={`text-sm ${messageClassName}`}>{notification.subtitle}</span>
        </div>
        <TaskLoggerActions
          taskId={notification.taskId}
          isHovered={isHovered}
          status={notification.status}
          progress={progress.toString()}
          cancelAction={onCancelButtonClicked}
          retryAction={retryFunction}
          isUploadTask={isUploadTask}
        />
      </div>
      {showProgressBar && <ProgressBar progress={progress} isPaused={notification.status === TaskStatus.Paused} />}
    </div>
  );
};

export default TaskLoggerItem;
