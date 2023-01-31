import { UserSubscription } from '@internxt/sdk/dist/drive/payments/types';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TabContext } from '..';
import CurrentPlan from '../../../../shared/components/CurrentPlan';

const CURRENCY_SYMBOLS = {
  USD: '$', // US Dollar
  EUR: '€', // Euro
  CRC: '₡', // Costa Rican Colón
  GBP: '£', // British Pound Sterling
  ILS: '₪', // Israeli New Sheqel
  INR: '₹', // Indian Rupee
  JPY: '¥', // Japanese Yen
  KRW: '₩', // South Korean Won
  NGN: '₦', // Nigerian Naira
  PHP: '₱', // Philippine Peso
  PLN: 'zł', // Polish Zloty
  PYG: '₲', // Paraguayan Guarani
  THB: '฿', // Thai Baht
  UAH: '₴', // Ukrainian Hryvnia
  VND: '₫', // Vietnamese Dong
};

export default function CurrentPlanWrapper({
  className = '',
  bytesInPlan,
  userSubscription,
}: {
  className?: string;
  bytesInPlan: number;
  userSubscription: UserSubscription;
}): JSX.Element {
  const { t } = useTranslation();
  let planName = '';
  let button: string | undefined;

  switch (userSubscription.type) {
    case 'free':
      planName = t('views.account.tabs.account.view.free.planName');
      button = t('views.account.tabs.account.view.free.button') as string;
      break;
    case 'lifetime':
      planName = t('views.account.tabs.account.view.lifetime.planName');
      button = undefined;
      break;
    case 'subscription':
      planName = t('views.account.tabs.account.view.subscription.planName');
      button = t('views.account.tabs.account.view.subscription.button') as string;
      break;
  }

  let planSubtitle: Parameters<typeof CurrentPlan>[0]['planSubtitle'];

  if (userSubscription.type === 'subscription') {
    const currencySymbol =
      CURRENCY_SYMBOLS[userSubscription.currency.toUpperCase()] ?? userSubscription.currency.toUpperCase();
    const mainLabel = `${userSubscription.amount / 100} ${currencySymbol}/ ${
      userSubscription.interval === 'year'
        ? t('views.account.tabs.account.view.subscription.yearly')
        : t('views.account.tabs.account.view.subscription.monthly')
    }`;

    const beforeMainLabelCrossed = userSubscription.amountAfterCoupon
      ? `${userSubscription.amountAfterCoupon / 100} ${currencySymbol}`
      : undefined;

    planSubtitle = { mainLabel, beforeMainLabelCrossed };
  }

  const tabContext = useContext(TabContext);

  function onClick() {
    tabContext.setActiveTab('plans');
  }

  return (
    <CurrentPlan
      className={className}
      onButtonClick={onClick}
      bytesInPlan={bytesInPlan}
      planName={planName}
      button={button}
      planSubtitle={planSubtitle}
    />
  );
}
