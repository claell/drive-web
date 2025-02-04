import { Elements } from '@stripe/react-stripe-js';
import { BaseSyntheticEvent, useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { DisplayPrice, UserType } from '@internxt/sdk/dist/drive/payments/types';
import { UserSettings } from '@internxt/sdk/dist/shared/types/userSettings';
import {
  Stripe,
  StripeElements,
  StripeElementsOptions,
  StripeElementsOptionsMode,
  loadStripe,
} from '@stripe/stripe-js';
import { useCheckout } from 'hooks/checkout/useCheckout';
import { useSelector } from 'react-redux';
import { useSignUp } from '../../../auth/components/SignUp/useSignUp';
import envService from '../../../core/services/env.service';
import errorService from '../../../core/services/error.service';
import localStorageService from '../../../core/services/local-storage.service';
import navigationService from '../../../core/services/navigation.service';
import RealtimeService from '../../../core/services/socket.service';
import { AppView, IFormValues } from '../../../core/types';
import databaseService from '../../../database/services/database.service';
import { getDatabaseProfileAvatar } from '../../../drive/services/database.service';
import { useTranslationContext } from '../../../i18n/provider/TranslationProvider';
import notificationsService, { ToastType } from '../../../notifications/services/notifications.service';
import checkoutService from '../../../payment/services/checkout.service';
import paymentService from '../../../payment/services/payment.service';
import LoadingPulse from '../../../shared/components/LoadingPulse/LoadingPulse';
import { RootState } from '../../../store';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { planThunks } from '../../../store/slices/plan';
import { useThemeContext } from '../../../theme/ThemeProvider';
import { getProductAmount } from '../../components/checkout/ProductCardComponent';
import authCheckoutService from '../../services/auth-checkout.service';
import { checkoutReducer, initialStateForCheckout } from '../../store/checkoutReducer';
import { AuthMethodTypes, CurrentPlanSelected, PlanData } from '../../types';
import CheckoutView from './CheckoutView';
import ChangePlanDialog from 'app/newSettings/Sections/Account/Plans/components/ChangePlanDialog';
import { fetchPlanPrices, getStripe } from 'app/newSettings/Sections/Account/Plans/api/plansApi';

export const THEME_STYLES = {
  dark: {
    backgroundColor: 'rgb(17 17 17)',
    textColor: 'rgb(255 255 255)',
    borderColor: 'rgb(58, 58, 59)',
    borderInputColor: 'rgb(142, 142, 148)',
    labelTextColor: 'rgb(229 229 235)',
  },
  light: {
    backgroundColor: 'rgb(255 255 255)',
    textColor: 'rgb(17 17 17)',
    borderColor: 'rgb(229, 229, 235)',
    borderInputColor: 'rgb(174, 174, 179)',
    labelTextColor: 'rgb(58 58 59)',
  },
};

const BORDER_SHADOW = 'rgb(0 102 255)';

export type UpsellManagerProps = {
  isUpsellSwitchActivated: boolean;
  showUpsellSwitch: boolean;
  onUpsellSwitchButtonClicked: () => void;
  amountSaved: number | undefined;
  amount: number | undefined;
};

export interface UserInfoProps {
  avatar: Blob | null;
  name: string;
  email: string;
}

export interface CheckoutViewManager {
  onCouponInputChange: (coupon: string) => void;
  onLogOut: () => Promise<void>;
  onCheckoutButtonClicked: (
    formData: IFormValues,
    event: BaseSyntheticEvent<object, any, any> | undefined,
    stripeSDK: Stripe | null,
    elements: StripeElements | null,
  ) => Promise<void>;
  onRemoveAppliedCouponCode: () => void;
  handleAuthMethodChange: (method: AuthMethodTypes) => void;
  onUserNameFromAddressElementChange: (userName: string) => void;
}

const ONE_YEAR_IN_MONTHS = 12;

const IS_PRODUCTION = envService.isProduction();

const RETURN_URL_DOMAIN = IS_PRODUCTION ? process.env.REACT_APP_HOSTNAME : 'http://localhost:3000';

let stripe;

export const stripePromise = (async () => {
  const stripeKey = IS_PRODUCTION ? process.env.REACT_APP_STRIPE_PK : process.env.REACT_APP_STRIPE_TEST_PK;
  return await loadStripe(stripeKey);
})();

const CheckoutViewWrapper = () => {
  const dispatch = useAppDispatch();
  const { translate } = useTranslationContext();
  const { checkoutTheme } = useThemeContext();
  const [state, dispatchReducer] = useReducer(checkoutReducer, initialStateForCheckout);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const user = useSelector<RootState, UserSettings>((state) => state.user.user!);
  const { doRegister } = useSignUp('activate');
  const userAuthComponentRef = useRef<HTMLDivElement>(null);

  const fullName = `${user?.name} ${user?.lastname}`;
  const isUserAuthenticated = !!user;
  const isAnyError = state.error?.coupon || state.error?.auth || state.error?.stripe;

  const {
    onRemoveAppliedCouponCode,
    setAuthMethod,
    setAvatarBlob,
    setCouponCodeName,
    setError,
    setIsUserPaying,
    setPlan,
    setPromoCodeData,
    setSelectedPlan,
    setStripeElementsOptions,
    setUserNameFromElementAddress,
  } = useCheckout(dispatchReducer);
  const [isUpsellSwitchActivated, setIsUpsellSwitchActivated] = useState<boolean>(false);
  const [isCheckoutReadyToRender, setIsCheckoutReadyToRender] = useState<boolean>(false);
  const [isUpdateSubscriptionDialogOpen, setIsUpdateSubscriptionDialogOpen] = useState<boolean>(false);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState<boolean>(false);
  const [individualPrices, setIndividualPrices] = useState<DisplayPrice[]>();

  const {
    authMethod,
    currentSelectedPlan,
    plan,
    avatarBlob,
    userNameFromAddressElement,
    couponCodeData,
    elementsOptions,
    promoCodeName,
  } = state;

  const userInfo: UserInfoProps = {
    name: fullName,
    avatar: avatarBlob,
    email: user?.email,
  };

  const upsellManager = {
    onUpsellSwitchButtonClicked: () => {
      setIsUpsellSwitchActivated(!isUpsellSwitchActivated);
      const planType = isUpsellSwitchActivated ? 'selectedPlan' : 'upsellPlan';
      const stripeElementsOptions = {
        ...(elementsOptions as StripeElementsOptionsMode),
        amount: plan![planType].amount,
      };
      setSelectedPlan(plan![planType]);
      setStripeElementsOptions(stripeElementsOptions);
    },
    isUpsellSwitchActivated,
    showUpsellSwitch: !!plan?.upsellPlan,
    amountSaved: plan?.upsellPlan
      ? (plan?.selectedPlan.amount * ONE_YEAR_IN_MONTHS - plan?.upsellPlan.amount) / 100
      : undefined,
    amount: plan?.upsellPlan?.decimalAmount,
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planId = params.get('planId');
    const promotionCode = params.get('couponCode');
    const currency = params.get('currency');

    const currencyValue = currency ?? 'eur';

    if (!planId) {
      navigationService.push(AppView.Drive);
      return;
    }

    fetchDataAndSetPrices();

    handleFetchSelectedPlan(planId, currencyValue)
      .then((plan) => {
        if (checkoutTheme && plan) {
          if (promotionCode) {
            handleFetchPromotionCode(plan.selectedPlan.id, promotionCode).catch((err) => {
              const showPromoCodeErrorNotification = true;
              handlePromoCodeError(err, showPromoCodeErrorNotification);
            });
          }

          const { backgroundColor, textColor, borderColor, borderInputColor, labelTextColor } =
            THEME_STYLES[checkoutTheme as string];
          loadStripeElements(textColor, backgroundColor, borderColor, borderInputColor, labelTextColor, plan);
        }
      })
      .catch(() => {});

    setIsCheckoutReadyToRender(true);
  }, [checkoutTheme]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setAuthMethod('userIsSignedIn');
      getDatabaseProfileAvatar()
        .then((avatarData) => setAvatarBlob(avatarData?.avatarBlob ?? null))
        .catch(() => {
          //
        });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (promoCodeName && currentSelectedPlan) {
      handleFetchPromotionCode(currentSelectedPlan?.id, promoCodeName).catch(handlePromoCodeError);
    }
  }, [promoCodeName]);

  useEffect(() => {
    if (isAnyError) {
      setTimeout(() => {
        setError('auth', undefined);
        setError('stripe', undefined);
        setError('coupon', undefined);
      }, 8000);
    }
  }, [state.error]);

  const fetchDataAndSetPrices = useCallback(async () => {
    try {
      const individualPrices = await fetchPlanPrices(UserType.Individual);
      setIndividualPrices(individualPrices);
    } catch (error) {
      const errorCasted = errorService.castError(error);
      errorService.reportError(errorCasted);
    }
  }, []);

  const onChangePlanClicked = async (priceId: string, currency: string) => {
    setIsUpdatingSubscription(true);
    await handleSubscriptionPayment(priceId);
    setIsUpdateSubscriptionDialogOpen(false);
    setIsUpdatingSubscription(false);
    navigationService.push(AppView.Drive);
  };

  const showSuccessSubscriptionNotification = useCallback(
    () => notificationsService.show({ text: 'Subscription updated successfully', type: ToastType.Success }),
    [translate],
  );

  const showCancelSubscriptionErrorNotification = useCallback(
    () =>
      notificationsService.show({
        text: translate('notificationMessages.errorCancelSubscription'),
        type: ToastType.Error,
      }),
    [translate],
  );

  const handlePaymentSuccess = () => {
    showSuccessSubscriptionNotification();
    dispatch(planThunks.initializeThunk()).unwrap();
  };

  const handleSubscriptionPayment = async (priceId: string) => {
    try {
      stripe = await getStripe(stripe);
      const updatedSubscription = await paymentService.updateSubscriptionPrice({
        priceId,
        userType: UserType.Individual,
      });
      if (updatedSubscription.request3DSecure) {
        stripe
          .confirmCardPayment(updatedSubscription.clientSecret)
          .then(async (result) => {
            if (result.error) {
              notificationsService.show({
                type: ToastType.Error,
                text: result.error.message as string,
              });
            } else {
              handlePaymentSuccess();
            }
          })
          .catch((err) => {
            const error = errorService.castError(err);
            errorService.reportError(error);
            showCancelSubscriptionErrorNotification();
          });
      } else {
        handlePaymentSuccess();
      }
    } catch (err) {
      const error = errorService.castError(err);
      errorService.reportError(error);
      showCancelSubscriptionErrorNotification();
    }
  };

  const onCheckoutButtonClicked = async (
    formData: IFormValues,
    event: BaseSyntheticEvent<object, any, any> | undefined,
    stripeSDK: Stripe | null,
    elements: StripeElements | null,
  ) => {
    event?.preventDefault();

    setIsUserPaying(true);

    const { email, password } = formData;

    const userData = getUserInfo(user, email, userNameFromAddressElement, fullName);

    try {
      await authCheckoutService.authenticateUser(email, password, authMethod, dispatch, doRegister);
    } catch (err) {
      const error = err as Error;
      setError('auth', error.message);
      (userAuthComponentRef.current as any).scrollIntoView();
      errorService.reportError(error);
      setIsUserPaying(false);
      return;
    }

    try {
      if (!stripeSDK || !elements) {
        console.error('Stripe.js has not loaded yet. Please try again later.');
        return;
      }

      const { error: elementsError } = await elements.submit();

      if (elementsError) {
        throw new Error(elementsError.message);
      }

      const { customerId, token } = await paymentService.getCustomerId(userData.name, userData.email);

      const { clientSecret, type, subscriptionId, paymentIntentId, invoiceStatus } =
        await checkoutService.getClientSecret(
          currentSelectedPlan as CurrentPlanSelected,
          token,
          customerId,
          couponCodeData?.codeId,
        );

      // TEMPORARY HOT FIX
      // Store subscriptionId, paymentIntendId, and amountPaid to send to IMPACT API
      // need to check all rest of needed values to add it to analytics in trackPaymentConversion function
      if (subscriptionId) localStorageService.set('subscriptionId', subscriptionId);
      if (paymentIntentId) localStorageService.set('paymentIntentId', paymentIntentId);
      if (plan?.selectedPlan) {
        const amountToPay = getProductAmount(plan?.selectedPlan.decimalAmount, couponCodeData)?.toFixed(2);
        localStorageService.set('amountPaid', amountToPay);
      }

      if (invoiceStatus && invoiceStatus === 'paid') {
        navigationService.push(AppView.CheckoutSuccess);
        return;
      }

      const confirmIntent = type === 'setup' ? stripeSDK.confirmSetup : stripeSDK.confirmPayment;

      const { error: confirmIntentError } = await confirmIntent({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${RETURN_URL_DOMAIN}/checkout/success`,
        },
      });

      if (confirmIntentError) {
        throw new Error(confirmIntentError.message);
      }
    } catch (err) {
      if ((err as any).status) {
        if ((err as any).status === 409) {
          setIsUpdateSubscriptionDialogOpen(true);
          return;
        } else if ((err as any).status === 422) {
          notificationsService.show({
            text: translate('notificationMessages.couponIsNotValidForUserError'),
            type: ToastType.Error,
          });
          return;
        }
      }

      notificationsService.show({
        text: translate('notificationMessages.errorCreatingSubscription'),
        type: ToastType.Error,
      });
      errorService.reportError(err);
    } finally {
      setIsUserPaying(false);
    }
  };

  const loadStripeElements = async (
    textColor: string,
    backgroundColor: string,
    borderColor: string,
    borderInputColor: string,
    labelTextColor: string,
    plan: PlanData,
  ) => {
    const stripeElementsOptions: StripeElementsOptions = {
      appearance: {
        labels: 'above',
        variables: {
          spacingAccordionItem: '8px',
          colorPrimary: textColor,
        },
        theme: 'flat',
        rules: {
          '.AccordionItem:hover': {
            color: textColor,
          },
          '.Block': {
            backgroundColor: backgroundColor,
          },
          '.TermsText': {
            color: textColor,
          },
          '.AccordionItem': {
            borderRadius: '16px',
            borderColor: borderColor,
            border: '1px solid',
            backgroundColor: backgroundColor,
          },
          '.Input': {
            backgroundColor: `${backgroundColor}`,
            borderRadius: '0.375rem',
            color: textColor,
            border: `1px solid ${borderInputColor}`,
          },
          '.Input:focus': {
            backgroundColor: `${backgroundColor}`,
            // borderColor: borderInputColor,
            boxShadow: `0px 0px 4px ${BORDER_SHADOW}`,
            border: `0.5px solid ${BORDER_SHADOW}`,
          },
          '.Input::selection': {
            backgroundColor: `${backgroundColor}`,
            // borderColor: borderInputColor,
            border: `0.5px solid ${BORDER_SHADOW}`,
          },
          '.Label': {
            color: labelTextColor,
            fontSize: '0.875rem',
          },
          '.RedirectText': {
            color: textColor,
          },
        },
      },
      mode: plan?.selectedPlan.interval === 'lifetime' ? 'payment' : 'subscription',
      amount: plan?.selectedPlan.amount,
      currency: plan?.selectedPlan.currency,
      payment_method_types: ['card', 'paypal'],
    };

    setStripeElementsOptions(stripeElementsOptions);

    stripe = await stripePromise;
  };

  const handleFetchSelectedPlan = async (planId: string, currency?: string) => {
    try {
      const plan = await checkoutService.fetchPlanById(planId, currency);
      setPlan(plan);
      setSelectedPlan(plan.selectedPlan);

      return plan;
    } catch (error) {
      errorService.reportError(error);
      if (user) {
        navigationService.push(AppView.Drive);
      } else {
        navigationService.push(AppView.Signup);
      }
    }
  };

  const handleFetchPromotionCode = async (priceId: string, promotionCode: string) => {
    const promoCodeData = await checkoutService.fetchPromotionCodeByName(priceId, promotionCode);
    const promoCode = {
      codeId: promoCodeData.codeId,
      codeName: promotionCode,
      amountOff: promoCodeData.amountOff,
      percentOff: promoCodeData.percentOff,
    };
    setPromoCodeData(promoCode);
  };

  const onLogOut = async () => {
    await databaseService.clear();
    localStorageService.clear();
    RealtimeService.getInstance().stop();
    setAuthMethod('signIn');
  };

  const getUserInfo = (user: UserSettings, email: string, userNameFromAddressElement: string, fullName: string) => {
    let userData;

    if (user) {
      userData = {
        name: fullName,
        email: user.email,
      };
    } else {
      userData = {
        name: userNameFromAddressElement,
        email: email,
      };
    }

    return userData;
  };

  const handlePromoCodeError = (err: unknown, showNotification?: boolean) => {
    const error = err as Error;
    const errorMessage = error.message.includes('Promotion code with an id')
      ? error.message
      : 'Something went wrong, try again later';
    setError('coupon', errorMessage);
    errorService.reportError(error);
    setPromoCodeData(undefined);

    if (showNotification) {
      notificationsService.show({
        text: errorMessage,
        type: ToastType.Error,
      });
    }
  };

  const checkoutViewManager: CheckoutViewManager = {
    onCouponInputChange: setCouponCodeName,
    onLogOut,
    onCheckoutButtonClicked,
    onRemoveAppliedCouponCode,
    handleAuthMethodChange: setAuthMethod,
    onUserNameFromAddressElementChange: setUserNameFromElementAddress,
  };

  return (
    <>
      {isCheckoutReadyToRender && elementsOptions && stripe ? (
        <Elements stripe={stripe} options={elementsOptions}>
          <CheckoutView
            checkoutViewVariables={state}
            userAuthComponentRef={userAuthComponentRef}
            userInfo={userInfo}
            isUserAuthenticated={isUserAuthenticated}
            upsellManager={upsellManager}
            authMethod={authMethod}
            checkoutViewManager={checkoutViewManager}
          />
          {individualPrices && currentSelectedPlan && isUpdateSubscriptionDialogOpen ? (
            <ChangePlanDialog
              prices={individualPrices}
              isDialogOpen={isUpdateSubscriptionDialogOpen}
              setIsDialogOpen={setIsUpdateSubscriptionDialogOpen}
              onPlanClick={onChangePlanClicked}
              priceIdSelected={currentSelectedPlan!.id}
              isUpdatingSubscription={isUpdatingSubscription}
              subscriptionSelected={UserType.Individual}
            />
          ) : undefined}
        </Elements>
      ) : (
        <LoadingPulse />
      )}
    </>
  );
};

export default CheckoutViewWrapper;
