import React, { SetStateAction } from 'react';
import { getIcon } from '../../../services/getIcon';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { IFormValues } from '../../../models/interfaces';
import { store2FA } from '../../../services/auth.service';
import AuthButton from '../../Buttons/AuthButton';
import AuthInput from '../../Inputs/AuthInput';
import notify from '../../Notifications';
import '../../Security.css';
import { twoFactorRegexPattern } from '../../../services/validation.service';

interface StepsProps {
  currentStep: number,
  qr: string,
  backupKey: string,
  setHas2FA: React.Dispatch<SetStateAction<boolean>>
}

const Steps = ({ currentStep, qr, backupKey, setHas2FA }: StepsProps): JSX.Element => {
  const { register, formState: { errors }, handleSubmit, reset } = useForm<IFormValues>({ mode: 'onChange' });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit: SubmitHandler<IFormValues> = async formData => {
    try {
      if (formData.backupKey !== backupKey) {
        setError('The backup key inserted does not match your unique backup key.');
        return;
      }
      setIsLoading(true);

      await store2FA(backupKey, formData.twoFactorCode);
      notify('Your Two-Factor Authentication has been activated!', 'success');
      setHas2FA(true);
      reset();
    } catch (err) {
      notify(err.message || 'Internal server error. Try again later', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === 2) {
    return (
      <div className="flex flex-col">
        <div>Use Authy, Google Authentication or a similar app to scan the QR Code below</div>
        <div className="flex items-center">
          <img src={qr} alt="Bidi Code" />
          <div className="flex flex-col justify-between h-full py-3 ml-4">
            <div className="bg-l-neutral-20 p-4 rounded-md w-max font-semibold text-neutral-500">{backupKey}</div>
            <div className="security-info_texts">If you are unable to scan the QR code<br />enter this code into the app.</div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className='flex flex-col items-center'>
        <div className='security-info_texts text-center'>Your backup key is below. You will need this incase you lose your device.<br />Keep an offline backup of your key. Keep it safe and secure.</div>
        <div className="bg-l-neutral-20 p-4 rounded-md w-max font-semibold text-neutral-500 mt-4">{backupKey}</div>
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <form className='flex w-full flex-col' onSubmit={handleSubmit(onSubmit)}>
        <span className='security-info_texts mb-4'>Finally, to enable Two-Factor Authentication, fill the fields below.</span>

        <div className='flex justify-between'>
          <AuthInput
            label='backupKey'
            placeholder='Backup key'
            type='text'
            error={errors.backupKey}
            register={register}
            required={true}
            icon='lockGray'
            minLength={1} />

          <div className='mx-2' />

          <AuthInput
            label='twoFactorCode'
            placeholder='Two-Factor code'
            type='text'
            error={errors.twoFactorCode}
            register={register}
            required={true}
            icon='lockGray'
            minLength={1}
            pattern={twoFactorRegexPattern} />
        </div>

        {
          error &&
          <div className='flex mt-1 mb-4 pl-2'>
            <div className='w-1.5 h-1.5 bg-neutral-600 rounded-full mt-2' />
            <span className='text-neutral-600 text-sm ml-2.5'>{error}</span>
          </div>
        }

        <AuthButton
          text='Enable Two-Factor Authentication'
          textWhenDisabled='Configuring Two-Factor Authenticator...'
          isDisabled={isLoading} />
      </form>
    );
  }

  return (
    <div className="box-step-1">
      <div className='text-sm text-neutral-700'>Download Authy, Google Authenticator or a similar app on your device.</div>
      <div className='flex items-center mt-4'>
        <img src={getIcon('googleAuthenticator')} className='mr-8' height={48} width={48} alt="Google Authenticator" />
        <img src={getIcon('appStore')} className='mr-2' height={48} width={150} alt="App Store" />
        <img src={getIcon('playStore')} height={48} width={150} alt="Google Play" />
      </div>
    </div>
  );
};

export default Steps;
