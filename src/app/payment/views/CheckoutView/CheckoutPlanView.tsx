import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { UserSettings } from '@internxt/sdk/dist/shared/types/userSettings';

import { AppView } from '../../../core/types';
import { RootState } from '../../../store';
import { useTranslationContext } from '../../../i18n/provider/TranslationProvider';
import { useAppDispatch } from '../../../store/hooks';
import navigationService from '../../../core/services/navigation.service';
import paymentService from '../../services/payment.service';
import notificationsService, { ToastType } from '../../../notifications/services/notifications.service';
import { PlanState, planActions } from '../../../store/slices/plan';

interface CheckoutOptions {
  price_id: string;
  coupon_code?: string;
  trial_days?: number;
  success_url: string;
  cancel_url: string;
  customer_email: string;
  mode: string | undefined;
  currency: string;
}

export default function CheckoutPlanView(): JSX.Element {
  const dispatch = useAppDispatch();
  const { translate } = useTranslationContext();

  const plan = useSelector((state: RootState) => state.plan) as PlanState;
  const user = useSelector((state: RootState) => state.user.user) as UserSettings;
  if (user === undefined) {
    navigationService.push(AppView.Login);
  }
  const { subscription } = plan;

  useEffect(() => {
    if (subscription) {
      const params = new URLSearchParams(window.location.search);
      const planId = String(params.get('planId'));
      const coupon = String(params.get('couponCode'));
      const mode = String(params.get('mode') as string | undefined);
      const freeTrials = Number(params.get('freeTrials'));
      const currency = String(params.get('currency'));
      checkout(planId, currency, coupon, mode, freeTrials);
    }
  }, [subscription]);

  async function checkout(planId: string, currency: string, coupon?: string, mode?: string, freeTrials?: number) {
    let response;

    const checkoutOptions: CheckoutOptions = {
      price_id: planId,
      success_url: `${window.location.origin}/checkout/success`,
      cancel_url: `${window.location.origin}/checkout/cancel`,
      customer_email: user.email,
      mode: mode,
      currency,
    };

    if (subscription?.type !== 'subscription') {
      try {
        if (coupon && freeTrials) {
          checkoutOptions.coupon_code = coupon;
          checkoutOptions.trial_days = freeTrials;
        } else if (coupon !== 'null') {
          checkoutOptions.coupon_code = coupon;
        }

        response = await paymentService.createCheckoutSession(checkoutOptions);
        localStorage.setItem('sessionId', response.sessionId);

        await paymentService.redirectToCheckout(response);
      } catch (err) {
        console.error(err);
        notificationsService.show({
          text: translate('notificationMessages.errorCancelSubscription'),
          type: ToastType.Error,
        });
      }
    } else {
      if (mode === 'payment') {
        try {
          if (coupon) {
            checkoutOptions.coupon_code = coupon;
          }
          response = await paymentService.createCheckoutSession(checkoutOptions);
          localStorage.setItem('sessionId', response.sessionId);
          await paymentService.redirectToCheckout(response).then(async (result) => {
            await paymentService.cancelSubscription();
            if (result.error) {
              notificationsService.show({
                type: ToastType.Error,
                text: result.error.message as string,
              });
            } else {
              notificationsService.show({
                type: ToastType.Success,
                text: 'Payment successful',
              });
            }
          });
        } catch (error) {
          console.error(error);
          notificationsService.show({
            text: translate('notificationMessages.errorCancelSubscription'),
            type: ToastType.Error,
          });
        }
      } else {
        try {
          const couponCode = coupon === 'null' ? undefined : coupon;
          const updatedSubscription = await paymentService.updateSubscriptionPrice(planId, couponCode);
          dispatch(planActions.setSubscription(updatedSubscription.userSubscription));
          navigationService.push(AppView.Preferences);
        } catch (err) {
          console.error(err);
          notificationsService.show({
            text: translate('notificationMessages.errorCancelSubscription'),
            type: ToastType.Error,
          });
        }
      }
    }
  }

  return <></>;
}
