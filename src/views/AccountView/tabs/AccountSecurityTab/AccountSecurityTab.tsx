import { useEffect, useState } from 'react';
import { generateNew2FA, userHas2FAStored } from '../../../../services/auth.service';
import React, { Fragment } from 'react';
import Deactivate2FA from './Deactivate2FA';
import Steps from './Steps';
import notify from '../../../../components/Notifications';

import './AccountSecurityTab.scss';

interface SecurityProps {
  isAuthenticated: boolean
}

const Security = ({ isAuthenticated }: SecurityProps): JSX.Element => {
  const [currentStep, setCurrentStep] = useState(1);
  const [has2FA, setHas2FA] = useState(false);
  const [qr, setQr] = useState('');
  const [backupKey, setBackupKey] = useState('');
  const [passwordSalt, setPasswordSalt] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const pickStep = (selectedStep) => {
    // Unable to go two steps forward
    if (currentStep - selectedStep < -1) {
      return;
    }

    setCurrentStep(selectedStep);
  };

  const check2FA = async () => {
    try {
      const has2fa = await userHas2FAStored();

      if (!has2fa) {
        const bidi = await generateNew2FA();

        setQr(bidi.qr);
        setBackupKey(bidi.code);
      } else {
        setHas2FA(true);
        setPasswordSalt(has2fa.sKey);
      }
    } catch (err) {
      notify('There was an error ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!has2FA) {
      check2FA();
    }
  }, [has2FA]);

  return (
    <div className='flex flex-col items-center justify-center security-container'>
      <h1 className='account_config_title mt-16'>Two-factor authentication</h1>

      <p className='account_config_description security-container'>Two-Factor Authentication provides an extra layer of security for your Internxt account by requiring a second step of verification when you sign in.
        In addition to your password, you'll also need a code generated by Authy, Google Authenticator or a similar on your phone.
        Follow the steps below to enable 2FA on your account.
      </p>

      {!isLoading ?
        <Fragment>
          <div className={`${has2FA ? 'hidden' : 'flex'} justify-between my-8 security-buttons_container security-container`}>
            <button onClick={() => pickStep(1)} className={`${currentStep === 1 ? 'security-button security-active_button' : 'security-button'}`}>
              <span className="number">1</span><span className="text">Download App</span>
            </button>

            <button onClick={() => pickStep(2)} className={`${currentStep === 2 ? 'security-button security-active_button' : 'security-button'}`}>
              <span className="number">2</span><span className="text">Scan QR Code</span>
            </button>

            <button onClick={() => pickStep(3)} className={`${currentStep === 3 ? 'security-button security-active_button' : 'security-button'} ${currentStep - 3 < -1 && 'cursor-default'}`}>
              <span className="number">3</span><span className="text">Backup Key</span>
            </button>

            <button onClick={() => pickStep(4)} className={`${currentStep === 4 ? 'security-button security-active_button' : 'security-button'} ${currentStep - 4 < -1 && 'cursor-default'}`}>
              <span className="number">4</span><span className="text">Enable</span>
            </button>
          </div>

          {has2FA ?
            <Deactivate2FA passwordSalt={passwordSalt} setHas2FA={setHas2FA} />
            :
            <Steps currentStep={currentStep} qr={qr} backupKey={backupKey} setHas2FA={setHas2FA} />
          }
        </Fragment>
        :
        <span>is loading haha</span>
      }
    </div>
  );
};

export default Security;
