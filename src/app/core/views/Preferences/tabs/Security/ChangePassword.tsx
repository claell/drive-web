import { UserSettings } from '@internxt/sdk/dist/shared/types/userSettings';
import { useTranslationContext } from 'app/i18n/provider/TranslationProvider';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { changePassword } from '../../../../../auth/services/auth.service';
import notificationsService, { ToastType } from '../../../../../notifications/services/notifications.service';
import Button from '../../../../../shared/components/Button/Button';
import Card from '../../../../../shared/components/Card';
import Input from '../../../../../shared/components/Input';
import Modal from '../../../../../shared/components/Modal';
import ValidPassword from '../../../../../shared/components/ValidPassword';
import { RootState } from '../../../../../store';
import Section from '../../components/Section';

export default function ChangePassword({
  className = '',
  currentPassword,
  onPasswordChanged,
}: {
  className?: string;
  currentPassword: string;
  onPasswordChanged: (newPassword: string) => void;
}): JSX.Element {
  const { translate } = useTranslationContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Section className={className} title={translate('views.account.tabs.security.changePassword.title')}>
      <Card>
        <p className="text-gray-60">{translate('views.account.tabs.security.changePassword.description')}</p>
        <Button className="mt-3" onClick={() => setIsModalOpen(true)} dataTest="change-password-button">
          {translate('views.account.tabs.security.changePassword.button')}
        </Button>
      </Card>
      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPassword={currentPassword}
        onPasswordChanged={onPasswordChanged}
      />
    </Section>
  );
}

function ChangePasswordModal({
  isOpen,
  onClose,
  currentPassword,
  onPasswordChanged,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentPassword: string;
  onPasswordChanged: (newPassword: string) => void;
}) {
  const { translate } = useTranslationContext();
  const user = useSelector<RootState, UserSettings | undefined>((state) => state.user.user);
  if (!user) throw new Error('User is not defined');
  const { email } = user;

  const DEFAULT_PASSWORD_PAYLOAD = { valid: false, password: '' };
  const [passwordPayload, setPasswordPayload] = useState(DEFAULT_PASSWORD_PAYLOAD);

  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const isConfirmationWrong = passwordPayload.password.slice(0, passwordConfirmation.length) !== passwordConfirmation;

  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    setIsLoading(true);
    await changePassword(passwordPayload.password, currentPassword, email);
    notificationsService.show({ text: translate('success.passwordChanged') as string, type: ToastType.Success });
    onPasswordChanged(passwordPayload.password);
    onClose();
    setIsLoading(false);
  }

  useEffect(() => {
    if (isOpen) {
      setPasswordPayload(DEFAULT_PASSWORD_PAYLOAD);
      setPasswordConfirmation('');
      setIsLoading(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h1 className="text-2xl font-medium text-gray-80">{translate('modals.changePasswordModal.title')}</h1>
      <ValidPassword
        username={email}
        className="mt-4"
        label={translate('modals.changePasswordModal.newPassword') as string}
        value={passwordPayload.password}
        onChange={setPasswordPayload}
        disabled={isLoading}
        dataTest="new-password"
      />
      <Input
        value={passwordConfirmation}
        onChange={setPasswordConfirmation}
        variant="password"
        className="mt-3"
        label={translate('modals.changePasswordModal.confirmPassword') as string}
        accent={isConfirmationWrong ? 'error' : undefined}
        message={
          isConfirmationWrong ? (translate('modals.changePasswordModal.errors.doesntMatch') as string) : undefined
        }
        disabled={isLoading}
        dataTest="new-password-confirmation"
      />
      <div className="mt-3 flex justify-end">
        <Button variant="secondary" disabled={isLoading} onClick={onClose}>
          {translate('actions.cancel')}
        </Button>
        <Button
          loading={isLoading}
          onClick={handleSubmit}
          disabled={!passwordPayload.valid || passwordConfirmation !== passwordPayload.password}
          className="ml-2"
          dataTest="next-button"
        >
          {translate('modals.changePasswordModal.title')}
        </Button>
      </div>
    </Modal>
  );
}
