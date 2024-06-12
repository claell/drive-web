import { PaymentMethod } from '@internxt/sdk/dist/drive/payments/types';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import paymentService from '../../../../../payment/services/payment.service';
import Button from '../../../../../shared/components/Button/Button';
import Card from '../../../../../shared/components/Card';
import Modal from '../../../../../shared/components/Modal';
import Spinner from '../../../../../shared/components/Spinner/Spinner';
import Section from '../../components/Section';

import visaIcon from '../../../../../../assets/icons/card-brands/visa.png';
import amexIcon from '../../../../../../assets/icons/card-brands/amex.png';
import dinersIcon from '../../../../../../assets/icons/card-brands/diners_club.png';
import discoverIcon from '../../../../../../assets/icons/card-brands/discover.png';
import jcbIcon from '../../../../../../assets/icons/card-brands/jcb.png';
import mastercardIcon from '../../../../../../assets/icons/card-brands/mastercard.png';
import unionpayIcon from '../../../../../../assets/icons/card-brands/unionpay.png';
import unknownIcon from '../../../../../../assets/icons/card-brands/unknown.png';
import { useTranslationContext } from 'app/i18n/provider/TranslationProvider';
import { Source } from '@stripe/stripe-js';

interface StateProps {
  tag: 'ready' | 'loading' | 'empty';
  card?: PaymentMethod['card'];
  type?: Source.Type;
}

const cardBrands: Record<PaymentMethod['card']['brand'], string> = {
  visa: visaIcon,
  amex: amexIcon,
  diners: dinersIcon,
  discover: discoverIcon,
  jcb: jcbIcon,
  mastercard: mastercardIcon,
  unionpay: unionpayIcon,
  unknown: unknownIcon,
};

const paymentsTypes = {
  paypal: 'PayPal',
  sepa_debit: 'SEPA Direct Debit',
};

export default function PaymentMethodComponent({ className = '' }: { className?: string }): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, setState] = useState<StateProps>({
    tag: 'loading',
  });
  const { translate } = useTranslationContext();

  useEffect(() => {
    paymentService
      .getDefaultPaymentMethod()
      .then((data: PaymentMethod | Source) => {
        if (data.card) {
          setState({ tag: 'ready', card: data.card as PaymentMethod['card'] });
        } else if ('type' in data) {
          setState({ tag: 'ready', type: data.type });
        } else {
          setState({ tag: 'empty' });
        }
      })
      .catch(() => setState({ tag: 'empty' }));
  }, []);

  return (
    <Section className={className} title={translate('views.account.tabs.billing.paymentMethod.head')}>
      <Card>
        {(state.tag === 'ready' && state.card) || (state.tag === 'ready' && state.type) ? (
          <InitialState payment={state} setIsModalOpen={setIsModalOpen} />
        ) : state.tag === 'loading' ? (
          <div className="flex h-10 items-center justify-center">
            <Spinner className="h-5 w-5" />
          </div>
        ) : (
          <Empty />
        )}
      </Card>

      <PaymentMethodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Section>
  );
}

//Create a function that returns the component when the state.tag = ready
function InitialState({ payment, setIsModalOpen }: { payment: StateProps; setIsModalOpen: (value: boolean) => void }) {
  const { translate } = useTranslationContext();
  const { card, type } = payment;

  return (
    <div className="flex">
      {card ? (
        <>
          <img className="h-9 rounded-md" src={cardBrands[card.brand]} />
          <div className="ml-4 flex-1">
            <div className="flex items-center text-gray-80">
              <p style={{ lineHeight: 1 }} className="font-serif text-2xl">
                {'···· ···· ····'}
              </p>
              <p className="ml-1.5 text-sm">{card.last4}</p>
            </div>
            <p className="text-xs text-gray-50">{`${card.exp_month}/${card.exp_year}`}</p>
          </div>
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
            {translate('actions.edit')}
          </Button>
        </>
      ) : (
        type && (
          <>
            <div className="ml-4 flex-1">
              <div className="flex items-center text-gray-100">
                <p className="text-base font-medium leading-tight">{paymentsTypes[type]}</p>
              </div>
              <p className="text-sm text-gray-50">
                {translate('views.account.tabs.billing.paymentMethod.contactUs.description')}
              </p>
            </div>
            <Button variant="secondary" onClick={() => window.open('mailto:hello@internxt.com', '_blank')}>
              {translate('views.account.tabs.billing.paymentMethod.contactUs.contact')}
            </Button>
          </>
        )
      )}
    </div>
  );
}

function PaymentMethodModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { translate } = useTranslationContext();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h1 className="text-2xl font-medium text-gray-80">
        {translate('views.account.tabs.billing.paymentMethod.title')}
      </h1>
      <Elements
        stripe={paymentService.getStripe()}
        options={{
          mode: 'setup',
          paymentMethodCreation: 'manual',
          setupFutureUsage: 'off_session',
          currency: 'eur',
          payment_method_types: ['card'],
        }}
      >
        <PaymentForm onClose={onClose} />
      </Elements>
    </Modal>
  );
}
function PaymentForm({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState<null | string>(null);
  const { translate } = useTranslationContext();
  const stripe = useStripe();
  const elements = useElements();
  async function handleSubmit() {
    if (!stripe || !elements) return;

    const { error: errorSubmit } = await elements.submit();
    if (errorSubmit) return;

    const { error: errorPaymentMethod, paymentMethod } = await stripe.createPaymentMethod({
      elements,
      params: {
        metadata: {
          // type: 'business',
          type: 'individual',
        },
      },
    });

    if (errorPaymentMethod) {
      setError(errorPaymentMethod.message || 'An error has ocurred');
      return;
    }

    await paymentService
      .updateSubscriptionPaymentMethod({
        // subscriptionType: 'B2B',
        subscriptionType: 'individual',
        paymentMethodId: paymentMethod.id,
      })
      .then((_) => window.location.reload())
      .catch((err) => {
        setError(err?.message || 'Something went wrong while trying to change your payment method');
      });
  }
  return (
    <>
      <PaymentElement className="mt-5" />
      {error && <p className="mt-2 text-sm text-red">{error}</p>}
      <div className="mt-3 flex items-center justify-end">
        <Button variant="secondary" onClick={onClose}>
          {translate('actions.cancel')}
        </Button>
        <Button onClick={handleSubmit} className="ml-2">
          {translate('actions.save')}
        </Button>
      </div>
    </>
  );
}

function Empty() {
  const { translate } = useTranslationContext();
  return (
    <div className="text-center">
      <h1 className="font-medium text-gray-60">{translate('views.account.tabs.billing.paymentMethod.empty.title')}</h1>
      <p className="text-sm text-gray-50">{translate('views.account.tabs.billing.paymentMethod.empty.subtitle')}</p>
    </div>
  );
}
