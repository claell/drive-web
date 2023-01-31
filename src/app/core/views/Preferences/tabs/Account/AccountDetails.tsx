import { UserSettings } from '@internxt/sdk/dist/shared/types/userSettings';
import { CheckCircle, Warning } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import userService from '../../../../../auth/services/user.service';
import notificationsService, { ToastType } from '../../../../../notifications/services/notifications.service';
import Button from '../../../../../shared/components/Button/Button';
import Card from '../../../../../shared/components/Card';
import Input from '../../../../../shared/components/Input';
import Modal from '../../../../../shared/components/Modal';
import Tooltip from '../../../../../shared/components/Tooltip';
import { RootState } from '../../../../../store';
import { useAppDispatch } from '../../../../../store/hooks';
import { updateUserProfileThunk } from '../../../../../store/slices/user';
import Section from '../../components/Section';

export default function AccountDetails({ className = '' }: { className?: string }): JSX.Element {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isSendingVerificationEmail, setIsSendingVerificationEmail] = useState(false);

  async function onResend() {
    setIsSendingVerificationEmail(true);
    await userService.sendVerificationEmail();
    notificationsService.show({ text: 'Verification email has been sent', type: ToastType.Success });
    setIsSendingVerificationEmail(false);
  }

  const user = useSelector<RootState, UserSettings | undefined>((state) => state.user.user);
  if (!user) throw new Error('User is not defined');

  const isVerified = user.emailVerified;

  return (
    <Section className={className} title={t('views.account.tabs.account.accountDetails.head')}>
      <Card>
        <div className="flex justify-between">
          <div className="flex min-w-0">
            <Detail label={t('views.account.tabs.account.accountDetails.card.name')} value={user.name} />
            <Detail
              label={t('views.account.tabs.account.accountDetails.card.lastname')}
              value={user.lastname}
              className="ml-8 pr-2"
            />
          </div>
          <Button className="flex-shrink-0" variant="secondary" onClick={() => setIsModalOpen(true)}>
            {t('actions.edit')}
          </Button>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <Detail label={t('views.account.tabs.account.accountDetails.card.email')} value={user.email} />
            {!isVerified && (
              <button
                onClick={onResend}
                disabled={isSendingVerificationEmail}
                className="font-medium text-primary hover:text-primary-dark disabled:text-gray-60"
              >
                {t('views.account.tabs.account.accountDetails.card.resendEmail')}
              </button>
            )}
          </div>
          <Tooltip
            style="dark"
            title={
              isVerified
                ? t('views.account.tabs.account.accountDetails.verify.verified')
                : t('views.account.tabs.account.accountDetails.verify.verify')
            }
            popsFrom="top"
            subtitle={
              isVerified ? undefined : (t('views.account.tabs.account.accountDetails.verify.description') as string)
            }
          >
            {isVerified ? (
              <CheckCircle weight="fill" className="text-green" size={24} />
            ) : (
              <Warning weight="fill" className="text-yellow" size={24} />
            )}
          </Tooltip>
        </div>
      </Card>
      <AccountDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        name={user.name}
        lastname={user.lastname}
      />
    </Section>
  );
}

function Detail({ className = '', label, value }: { className?: string; label: string; value: string }): JSX.Element {
  return (
    <div className={`${className} min-w-0 text-gray-80`}>
      <h2 className="truncate text-sm">{label}</h2>
      <h1 className="truncate text-lg font-medium">{value}</h1>
    </div>
  );
}

function AccountDetailsModal({
  isOpen,
  onClose,
  name,
  lastname,
}: {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  lastname: string;
}) {
  useEffect(() => {
    if (isOpen) {
      setStatus({ tag: 'ready' });
    }
  }, [isOpen]);
  const dispatch = useAppDispatch();
  const [nameValue, setNameValue] = useState(name);
  const [lastnameValue, setLastnameValue] = useState(lastname);

  const [status, setStatus] = useState<
    { tag: 'ready' } | { tag: 'loading' } | { tag: 'error'; type: 'NAME_INVALID' | 'LASTNAME_INVALID' | 'UNKNOWN' }
  >({ tag: 'ready' });

  const nameIsInvalid = status.tag === 'error' && status.type === 'NAME_INVALID';
  const lastnameIsInvalid = status.tag === 'error' && status.type === 'LASTNAME_INVALID';

  function validate(value: string) {
    return value.length > 0 && value.length < 20;
  }
  async function onSave() {
    if (!validate(nameValue)) {
      setStatus({ tag: 'error', type: 'NAME_INVALID' });
    } else if (!validate(lastnameValue)) {
      setStatus({ tag: 'error', type: 'LASTNAME_INVALID' });
    } else {
      try {
        setStatus({ tag: 'loading' });
        await dispatch(updateUserProfileThunk({ name: nameValue, lastname: lastnameValue })).unwrap();
        notificationsService.show({ text: 'Profile updated successfully', type: ToastType.Success });
        onClose();
      } catch {
        setStatus({ tag: 'error', type: 'UNKNOWN' });
        notificationsService.show({ text: 'We could not update your profile', type: ToastType.Error });
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h1 className="text-2xl font-medium text-gray-80">Account details</h1>
      <Input
        disabled={status.tag === 'loading'}
        className="mt-4"
        label="Name"
        value={nameValue}
        onChange={setNameValue}
        accent={nameIsInvalid ? 'error' : undefined}
        message={nameIsInvalid ? 'This name is invalid' : undefined}
        name="firstName"
      />
      <Input
        disabled={status.tag === 'loading'}
        className="mt-3"
        label="Lastname"
        value={lastnameValue}
        onChange={setLastnameValue}
        accent={lastnameIsInvalid ? 'error' : undefined}
        message={lastnameIsInvalid ? 'This lastname is invalid' : undefined}
        name="lastName"
      />
      <div className="mt-3 flex justify-end">
        <Button disabled={status.tag === 'loading'} variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button loading={status.tag === 'loading'} className="ml-2" onClick={onSave}>
          Save
        </Button>
      </div>
    </Modal>
  );
}
