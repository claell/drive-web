import { useEffect } from 'react';
import { Fragment, useState } from 'react';
import UilCheck from '@iconscout/react-unicons/icons/uil-check';

import './ProductItem.scss';
import numberService from 'app/core/services/number.service';
import screenService from 'app/core/services/screen.service';
import NumberInput from 'app/shared/components/forms/inputs/NumberInput';
import { planSelectors } from 'app/store/slices/plan';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import BaseButton from 'app/shared/components/forms/BaseButton';
import { ProductData } from '../../types';
import { paymentThunks } from 'app/store/slices/payment';
import moneyService from '../../services/money.service';
import { useTranslationContext } from 'app/i18n/provider/TranslationProvider';

interface ProductItemProps {
  product: ProductData;
  currentPlanId: string | undefined;
  isBuyButtonDisabled: boolean;
  isBusiness: boolean;
}

const ProductItem = (props: ProductItemProps): JSX.Element => {
  const { translate } = useTranslationContext();
  const dispatch = useAppDispatch();
  const [isLgScreen, setIsLgScreen] = useState(screenService.isLg());
  const [teamMembersCount, setTeamMembersCount] = useState(2);
  const currentPriceId = useAppSelector((state) => state.payment.currentPriceId);
  const isCurrentProduct = currentPriceId === props.product.price.id;
  const priceMultiplier = props.product.metadata.is_drive ? 1 : teamMembersCount;
  const isPlanActive = useAppSelector(planSelectors.isPlanActive)(props.product.price.id);
  const isBuyButtonDisabled = props.isBuyButtonDisabled || isPlanActive;
  const monthlyAmountMultiplied = props.product.price.monthlyAmount * priceMultiplier;
  const monthlyAmountFormatted =
    moneyService.getCurrencySymbol(props.product.price.currency) +
    (numberService.hasDecimals(monthlyAmountMultiplied)
      ? monthlyAmountMultiplied.toFixed(2)
      : monthlyAmountMultiplied.toFixed());
  const totalAmount = props.product.price.amount * priceMultiplier;
  const totalAmountFormatted =
    moneyService.getCurrencySymbol(props.product.price.currency) +
    (numberService.hasDecimals(totalAmount) ? totalAmount.toFixed(2) : totalAmount.toFixed());
  const onBuyButtonClicked = async () => {
    if (props.product.metadata.is_drive) {
      dispatch(
        paymentThunks.checkoutThunk({
          product: props.product,
        }),
      );
    } else {
      dispatch(paymentThunks.teamsCheckoutThunk({ product: props.product, teamMembersCount }));
    }
  };
  const desktopBuyButtonLabel =
    isBuyButtonDisabled && isCurrentProduct ? translate('general.loading.redirecting') : translate('actions.buy');
  const tabletBuyButtonLabel =
    isBuyButtonDisabled && isCurrentProduct
      ? translate('general.loading.redirecting')
      : monthlyAmountFormatted + '/' + translate('general.time.month');
  const sizeClassName = props.product.metadata.is_drive ? 'square' : '';

  useEffect(() => {
    setIsLgScreen(screenService.isLg());
  });

  const desktopTemplate = (
    <div className={`product-item desktop rounded-lg ${isPlanActive ? 'active' : ''}`}>
      <div
        className={`${
          isPlanActive ? 'visible' : 'invisible'
        } rounded-translate-lg flex items-center justify-center bg-primary py-2 text-xs font-semibold text-white`}
      >
        {translate('drive.currentPlan')}
      </div>
      <div
        className={`${sizeClassName} flex flex-col justify-center
         rounded-lg border border-gray-5 bg-white p-6 text-gray-80`}
      >
        {/* SIMPLE NAME */}
        <h4 className="mx-auto mb-4 w-min rounded-3xl bg-gray-5 px-4 py-1 font-semibold text-gray-40">
          {props.product.metadata.simple_name}
        </h4>

        {/* MONTHLY AMOUNT */}
        <div className="flex items-center justify-center">
          <span className="mr-2 text-3xl font-bold">{monthlyAmountFormatted}</span>
          <span className="h-fit">/{translate('general.time.month')}</span>
        </div>

        {/* TOTAL AMOUNT */}
        {props.product.metadata.is_teams ? (
          <div className="mb-2 mt-6 rounded-lg border border-gray-5 bg-gray-1 p-4">
            <NumberInput
              className="mb-2"
              initialValue={teamMembersCount}
              min={2}
              unitLabel="users"
              onChange={setTeamMembersCount}
            />

            <div className="flex w-full items-center justify-center">
              <Fragment>
                <span className="mr-1">{totalAmountFormatted}</span>
                <span className="text-xs text-gray-50">
                  /{translate(`general.renewalPeriod.${props.product.renewalPeriod}`).toLowerCase()}
                </span>
              </Fragment>
            </div>
          </div>
        ) : (
          <span className="mb-4 mt-2 text-center text-xs text-gray-40">
            {translate('general.billing.billedEachPeriod', {
              price: totalAmountFormatted,
              period: translate(`general.renewalPeriod.${props.product.renewalPeriod}`).toLowerCase(),
            })}
          </span>
        )}
        <div />
        <BaseButton
          className="primary w-full font-semibold"
          disabled={isBuyButtonDisabled}
          onClick={onBuyButtonClicked}
        >
          {desktopBuyButtonLabel}
        </BaseButton>
      </div>
    </div>
  );
  const tabletTemplate = (
    <div className="product-item tablet">
      <div className="w-36">
        <div className={`${isPlanActive ? 'text-primary' : ''} flex`}>
          <span className="mr-3 block text-xl font-bold">{props.product.metadata.simple_name}</span>
          {isPlanActive && <UilCheck />}
        </div>

        <span className={`${isPlanActive ? 'text-primary' : 'text-gray-40'} block text-xs`}>
          {translate('general.billing.billedEachPeriod', {
            price: totalAmountFormatted,
            period: translate(`general.renewalPeriod.${props.product.renewalPeriod}`).toLowerCase(),
          })}
        </span>
      </div>

      {props.product.metadata.is_teams && (
        <NumberInput initialValue={teamMembersCount} min={2} unitLabel="users" onChange={setTeamMembersCount} />
      )}

      <BaseButton onClick={onBuyButtonClicked} className="primary w-36 font-semibold" disabled={isBuyButtonDisabled}>
        {tabletBuyButtonLabel}
      </BaseButton>
    </div>
  );

  return isLgScreen ? desktopTemplate : tabletTemplate;
};

export default ProductItem;
