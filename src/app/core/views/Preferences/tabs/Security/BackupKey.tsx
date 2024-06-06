import { useTranslationContext } from 'app/i18n/provider/TranslationProvider';
import { saveAs } from 'file-saver';
import notificationsService, { ToastType } from '../../../../../notifications/services/notifications.service';
import Button from '../../../../../shared/components/Button/Button';
import Card from '../../../../../shared/components/Card';
import localStorageService from '../../../../services/local-storage.service';
import Section from '../../components/Section';
import { TrackingPlan } from 'app/analytics/TrackingPlan';
import { trackBackupKeyDownloaded } from 'app/analytics/services/analytics.service';

/**
 * Downloads the backup key of the user and shows a notification
 * @param translate used for the notification message
 */
export function handleExport(translate) {
  const trackBackupKeyDownloadedProperties: TrackingPlan.BackupKeyDownloadedProperties = {
    backup_key_downloaded: true,
  };
  const mnemonic = localStorageService.get('xMnemonic');
  if (!mnemonic) {
    notificationsService.show({
      text: translate('views.account.tabs.security.backupKey.error'),
      type: ToastType.Error,
    });
  } else {
    saveAs(new Blob([mnemonic], { type: 'text/plain' }), 'INTERNXT-BACKUP-KEY.txt');
    notificationsService.show({
      text: translate('views.account.tabs.security.backupKey.success'),
      type: ToastType.Success,
    });
    trackBackupKeyDownloaded(trackBackupKeyDownloadedProperties);
  }
}

export default function BackupKey({ className = '' }: { className?: string }): JSX.Element {
  const { translate } = useTranslationContext();

  return (
    <Section className={className} title={translate('views.account.tabs.security.backupKey.title')}>
      <Card>
        <p className="text-gray-60">{translate('views.account.tabs.security.backupKey.description')}</p>
        <Button onClick={() => handleExport(translate)} className="mt-3">
          {translate('views.account.tabs.security.backupKey.button')}
        </Button>
      </Card>
    </Section>
  );
}
