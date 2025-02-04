import {
  CreateCheckoutSessionPayload,
  CreatedSubscriptionData,
  CustomerBillingInfo,
  DisplayPrice,
  FreeTrialAvailable,
  Invoice,
  InvoicePayload,
  PaymentMethod,
  RedeemCodePayload,
  UserSubscription,
  UserType,
} from '@internxt/sdk/dist/drive/payments/types';
import { RedirectToCheckoutServerOptions, Source, Stripe, StripeError } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { generateMnemonic } from 'bip39';
import { SdkFactory } from '../../core/factory/sdk';
import envService from '../../core/services/env.service';
import httpService from '../../core/services/http.service';
import { encryptPGP } from '../../crypto/services/utilspgp';
import { LifetimeTier, StripeSessionMode } from '../types';

export interface CreatePaymentSessionPayload {
  test?: boolean;
  lifetime_tier?: LifetimeTier;
  mode: StripeSessionMode;
  priceId: string;
  successUrl?: string;
  canceledUrl?: string;
}

export interface CreateTeamsPaymentSessionPayload {
  test?: boolean;
  mode: StripeSessionMode;
  priceId: string;
  quantity: number;
  mnemonicTeam: string;
  successUrl?: string;
  canceledUrl?: string;
}

let stripe: Stripe;

const paymentService = {
  async getStripe(): Promise<Stripe> {
    if (!stripe) {
      stripe = (await loadStripe(
        envService.isProduction() ? process.env.REACT_APP_STRIPE_PK : process.env.REACT_APP_STRIPE_TEST_PK,
      )) as Stripe;
    }

    return stripe;
  },

  async getCustomerId(name: string, email: string): Promise<{ customerId: string; token: string }> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.createCustomer(name, email);
  },

  async createSubscription(
    customerId: string,
    priceId: string,
    token: string,
    currency: string,
    promoCode?: string,
    seats = 1,
  ): Promise<CreatedSubscriptionData> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.createSubscription(customerId, priceId, token, seats, currency, promoCode);
  },

  async createPaymentIntent(
    customerId: string,
    amount: number,
    planId: string,
    token: string,
    currency?: string,
    promoCode?: string,
  ): Promise<{ clientSecret: string; id: string; invoiceStatus?: string }> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.createPaymentIntent(customerId, amount, planId, token, currency, promoCode);
  },

  async createSession(payload: CreatePaymentSessionPayload): Promise<{ id: string }> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.createSession(payload);
  },

  async createSetupIntent(userType?: UserType): Promise<{ clientSecret: string }> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.getSetupIntent(userType);
  },

  async getDefaultPaymentMethod(userType?: UserType): Promise<PaymentMethod | Source> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.getDefaultPaymentMethod(userType);
  },

  async getInvoices(payload: InvoicePayload): Promise<Invoice[]> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.getInvoices(payload);
  },

  async redirectToCheckout(options: RedirectToCheckoutServerOptions): Promise<{ error: StripeError }> {
    const stripe = await this.getStripe();

    return stripe.redirectToCheckout(options);
  },

  async getUserSubscription(userType?: UserType): Promise<UserSubscription> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.getUserSubscription(userType);
  },

  async getPrices(currency?: string, userType?: UserType): Promise<DisplayPrice[]> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.getPrices(currency, userType);
  },

  async isCouponUsedByUser(couponCode: string): Promise<{
    couponUsed: boolean;
  }> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.isCouponUsedByUser({ couponCode: couponCode });
  },

  async requestPreventCancellation(): Promise<FreeTrialAvailable> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.requestPreventCancellation();
  },

  async preventCancellation(): Promise<void> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.preventCancellation();
  },

  async redeemCode(payload: RedeemCodePayload): Promise<void> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.applyRedeemCode({
      code: payload.code,
      provider: payload.provider,
    });
  },

  async updateSubscriptionPrice({
    priceId,
    coupon,
    userType,
  }: {
    priceId: string;
    coupon?: string;
    userType: UserType.Individual | UserType.Business;
  }): Promise<{ userSubscription: UserSubscription; request3DSecure: boolean; clientSecret: string }> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();

    return paymentsClient.updateSubscriptionPrice({ priceId, couponCode: coupon, userType });
  },

  async cancelSubscription(userType?: UserType): Promise<void> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();

    return paymentsClient.cancelSubscription(userType);
  },

  async createCheckoutSession(
    payload: CreateCheckoutSessionPayload & { mode?: string },
  ): Promise<{ sessionId: string }> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();

    return paymentsClient.createCheckoutSession(payload);
  },

  async updateCustomerBillingInfo(payload: CustomerBillingInfo): Promise<void> {
    const paymentsClient = await SdkFactory.getInstance().createPaymentsClient();
    return paymentsClient.updateCustomerBillingInfo(payload);
  },

  // TODO: refactor as individual
  async handlePaymentTeams(priceId: string, quantity: number, mode: StripeSessionMode): Promise<void> {
    const mnemonicTeam = generateMnemonic(256);
    const encMnemonicTeam = await encryptPGP(mnemonicTeam);
    const codMnemonicTeam = Buffer.from(encMnemonicTeam).toString('base64');
    const payload: CreateTeamsPaymentSessionPayload = {
      mode,
      priceId,
      quantity,
      mnemonicTeam: codMnemonicTeam,
      test: !envService.isProduction(),
    };

    const response = await fetch(`${process.env.REACT_APP_API_URL}/stripe/teams/session`, {
      method: 'POST',
      headers: httpService.getHeaders(true, false),
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .catch((err) => {
        console.error('Error starting Stripe session. Reason: %s', err);
        throw err;
      });

    if (response.error) {
      throw Error(response.error);
    }

    const stripe = await this.getStripe();

    await stripe.redirectToCheckout({ sessionId: response.id });
  },
};

export default paymentService;
