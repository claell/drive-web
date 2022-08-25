/*import { useState, useEffect } from 'react';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import * as bip39 from 'bip39';
import queryString from 'query-string';
import { aes, auth } from '@internxt/lib';
import { Link } from 'react-router-dom';
import UilLock from '@iconscout/react-unicons/icons/uil-lock';
import UilEyeSlash from '@iconscout/react-unicons/icons/uil-eye-slash';
import UilEye from '@iconscout/react-unicons/icons/uil-eye';
import UilUser from '@iconscout/react-unicons/icons/uil-user';
import UilEnvelope from '@iconscout/react-unicons/icons/uil-envelope';
import {Eye, EyeSlash, WarningCircle} from 'phosphor-react';
import { emailRegexPattern } from '@internxt/lib/dist/src/auth/isValidEmail';
import { isValidPasswordRegex } from '@internxt/lib/dist/src/auth/isValidPassword';
import { Keys, RegisterDetails } from '@internxt/sdk/dist/auth';
import { readReferalCookie } from '../../services/auth.service';
import AuthSideInfo from '../../components/AuthSideInfo/AuthSideInfo';
import localStorageService from 'app/core/services/local-storage.service';
import analyticsService, { signupDevicesource, signupCampaignSource } from 'app/analytics/services/analytics.service';
import BaseInput from 'app/shared/components/forms/inputs/BaseInput';
import BaseCheckbox from 'app/shared/components/forms/BaseCheckbox/BaseCheckbox';
import AuthButton from 'app/shared/components/AuthButton';
import { useAppDispatch } from 'app/store/hooks';
import { decryptTextWithKey, encryptText, encryptTextWithKey, passToHash } from 'app/crypto/services/utils';
import { userActions, userThunks } from 'app/store/slices/user';
import { generateNewKeys } from 'app/crypto/services/pgp.service';
import { planThunks } from 'app/store/slices/plan';
import { getAesInitFromEnv } from 'app/crypto/services/keys.service';
import errorService from 'app/core/services/error.service';
import navigationService from 'app/core/services/navigation.service';
import { productsThunks } from 'app/store/slices/products';
import httpService from 'app/core/services/http.service';
import { AppView, IFormValues } from 'app/core/types';
import { UserSettings } from '@internxt/sdk/dist/shared/types/userSettings';
import { referralsThunks } from 'app/store/slices/referrals';
import { SdkFactory } from '../../../core/factory/sdk';
import TextInput from '../../components/TextInput/TextInput';
import PasswordInput from '../../components/PasswordInput/PasswordInput';
import Button from '../../components/Button/Button';*/
import bigLogo from 'assets/icons/big-logo.svg';
//import testPasswordStrength from '@internxt/lib/dist/src/auth/testPasswordStrength';
//import PasswordStrengthIndicator from 'app/shared/components/PasswordStrengthIndicator';
import SignUp from '../../components/SignUp/SignUp';
export interface SignUpViewProps {
  location: {
    search: string;
  };
  isNewUser: boolean;
  //onChange: (payload: { valid: boolean; password: string }) => void;
}

const SignUpView = (props: SignUpViewProps): JSX.Element => {
  /*const qs = queryString.parse(navigationService.history.location.search);
  const hasEmailParam = (qs.email && auth.isValidEmail(qs.email as string)) || false;
  const tokenParam = qs.token;
  const hasReferrer = !!qs.ref;
  const {
    register,
    formState: { errors, isValid },
    handleSubmit,
    control,
  } = useForm<IFormValues>({
    mode: 'onChange',
    defaultValues: {
      email: hasEmailParam ? (qs.email as string) : '',
    },
  });
  const dispatch = useAppDispatch();

  const password = useWatch({ control, name: 'password', defaultValue: '' });
  const confirmPassword = useWatch({ control, name: 'confirmPassword', defaultValue: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [signupError, setSignupError] = useState<Error | string>();
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordState, setPasswordState] = useState<{ tag: 'error' | 'warning' | 'success'; label: string } | null>(null);

  const [showPasswordIndicator, setShowPasswordIndicator] = useState(false);

  const formInputError = Object.values(errors)[0];

  let bottomInfoError: null | string = null;

  if (formInputError?.message) {
    bottomInfoError = formInputError.message;
  } else if (showError && signupError) {
    bottomInfoError = signupError.toString();
  }

  useEffect(() => {
    const isAppSumo = navigationService.getCurrentView()?.id === AppView.AppSumo;

    if (isAppSumo && tokenParam && typeof tokenParam === 'string') {
      localStorageService.clear();
      localStorageService.set('xToken', tokenParam);
    }
  }, []);

  function onChangeHandler(input: string) {
    const result = testPasswordStrength(input, (qs.email as string) === undefined? '' : (qs.email as string));
    if (!result.valid) {
      setPasswordState({
        tag: 'error',
        label:
          result.reason === 'NOT_COMPLEX_ENOUGH'
            ? 'Password is not complex enough'
            : 'Password has to be at least 8 characters long',
      });
    } else if (result.strength === 'medium') {
      setPasswordState({ tag: 'warning', label: 'Password is weak' });
    } else {
      setPasswordState({ tag: 'success', label: 'Password is strong' });
    }

   // props.onChange({ valid: result.valid, password: input });
  }

  const updateInfo = (name: string, lastname: string, email: string, password: string) => {
    // Setup hash and salt
    const hashObj = passToHash({ password: password });
    const encPass = encryptText(hashObj.hash);
    const encSalt = encryptText(hashObj.salt);

    // Setup mnemonic
    const mnemonic = bip39.generateMnemonic(256);
    const encMnemonic = encryptTextWithKey(mnemonic, password);

    // Body
    const body = {
      name: name,
      lastname: lastname,
      email: email,
      password: encPass,
      mnemonic: encMnemonic,
      salt: encSalt,
      referral: readReferalCookie(),
    };

    const fetchHandler = async (res: Response) => {
      const body = await res.text();

      try {
        const bodyJson = JSON.parse(body);

        return { res: res, body: bodyJson };
      } catch {
        return { res: res, body: body };
      }
    };
    const activate = qs.register === 'activate' ? 'activate' : 'appsumo';
    return fetch(`${process.env.REACT_APP_API_URL}/api/${activate}/update`, {
      method: 'POST',
      headers: httpService.getHeaders(true, false),
      body: JSON.stringify(body),
    })
      .then(fetchHandler)
      .then(({ res, body }) => {
        if (res.status !== 200) {
          throw Error(body.error || 'Internal Server Error');
        } else {
          return body;
        }
      })
      .then((res) => {
        const xToken = res.token;
        const xUser = res.user;

        xUser.mnemonic = mnemonic;
        dispatch(userActions.setUser(xUser));
        analyticsService.trackSignUp({
          userId: xUser.uuid,
          properties: {
            email: xUser.email,
            signup_source: signupCampaignSource(window.location.search),
          },
          traits: {
            email: xUser.email,
            first_name: name,
            last_name: lastname,
            usage: 0,
            createdAt: new Date().toISOString(),
            signup_device_source: signupDevicesource(window.navigator.userAgent),
            acquisition_channel: signupCampaignSource(window.location.search),
          },
        });

        if (activate === 'activate') {
          analyticsService.trackPaymentConversion();
        }
        return dispatch(userThunks.initializeUserThunk()).then(() => {
          localStorageService.set('xToken', xToken);
          localStorageService.set('xMnemonic', mnemonic);
        });
      });
  };

  const doRegister = async (name: string, lastname: string, email: string, password: string, captcha: string) => {
    const hashObj = passToHash({ password: password });
    const encPass = encryptText(hashObj.hash);
    const encSalt = encryptText(hashObj.salt);
    const mnemonic = bip39.generateMnemonic(256);
    const encMnemonic = encryptTextWithKey(mnemonic, password);

    const { privateKeyArmored, publicKeyArmored, revocationCertificate } = await generateNewKeys();
    const encPrivateKey = aes.encrypt(privateKeyArmored, password, getAesInitFromEnv());

    const authClient = SdkFactory.getInstance().createAuthClient();

    const keys: Keys = {
      privateKeyEncrypted: encPrivateKey,
      publicKey: publicKeyArmored,
      revocationCertificate: revocationCertificate,
    };
    const registerDetails: RegisterDetails = {
      name: name,
      lastname: lastname,
      email: email,
      password: encPass,
      salt: encSalt,
      mnemonic: encMnemonic,
      keys: keys,
      captcha: captcha,
      referral: readReferalCookie(),
      referrer: hasReferrer ? String(qs.ref) : undefined,
    };

    authClient
      .register(registerDetails)
      .then((data) => {
        const token = data.token;
        const user: UserSettings = {
          ...data.user,
          bucket: '',
        };
        const uuid = data.uuid;

        user.privateKey = Buffer.from(aes.decrypt(user.privateKey, password)).toString('base64');

        analyticsService.trackSignUp({
          userId: uuid,
          properties: {
            signup_source: signupCampaignSource(window.location.search),
            email: email,
          },
          traits: {
            member_tier: 'free',
            email: email,
            first_name: name,
            last_name: lastname,
            usage: 0,
            createdAt: new Date().toISOString(),
            signup_device_source: signupDevicesource(window.navigator.userAgent),
            acquisition_channel: signupCampaignSource(window.location.search),
          },
        });

        // adtrack script
        window._adftrack = Array.isArray(window._adftrack)
          ? window._adftrack
          : window._adftrack
          ? [window._adftrack]
          : [];
        window._adftrack.push({
          HttpHost: 'track.adform.net',
          pm: 2370627,
          divider: encodeURIComponent('|'),
          pagename: encodeURIComponent('New'),
        });

        localStorageService.set('xToken', token);
        user.mnemonic = decryptTextWithKey(user.mnemonic, password);
        dispatch(userActions.setUser({ ...user }));
        localStorageService.set('xMnemonic', user.mnemonic);

        dispatch(productsThunks.initializeThunk());
        dispatch(planThunks.initializeThunk());
        dispatch(referralsThunks.initializeThunk());
        dispatch(userThunks.initializeUserThunk()).then(() => {
          navigationService.push(AppView.Drive);
        });
      })
      .catch((err) => {
        console.error('Register error', err);
        setSignupError(err.message || err);
        setShowError(true);
        setIsLoading(false);
      });
  };

  const onSubmit: SubmitHandler<IFormValues> = async (formData) => {
    setIsLoading(true);
    try {
      const { name, lastname, email, password, confirmPassword, token } = formData;

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!props.isNewUser) {
        await updateInfo(name, lastname, email, password)
          .then(() => {
            dispatch(productsThunks.initializeThunk());
            dispatch(planThunks.initializeThunk());
            navigationService.push(AppView.Drive);
          })
          .catch((err) => {
            setIsLoading(false);
            console.log('ERR', err);
            throw new Error(err.message + ', please contact us');
          });
      } else {
        await doRegister(name, lastname, email, password, token);
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const castedError = errorService.castError(err);
      setSignupError(castedError.message);
    } finally {
      setShowError(true);
    }
  };

  async function getReCaptcha(formValues: IFormValues) {
    const grecaptcha = window.grecaptcha;

    grecaptcha.ready(() => {
      grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_V3, { action: 'register' }).then((token) => {
        // Can't wait or token will expire
        formValues.token = token;
        onSubmit(formValues);
      });
    });
  }*/

  return (
    <div className="flex h-full w-full bg-gray-5 justify-center">
     
      <img src={bigLogo} width="150" alt="" className='absolute top-10 left-20'/> 
      <div className='mt-48'>
        <SignUp {...props}/>
      </div>
    </div>
  );
};

export default SignUpView;
