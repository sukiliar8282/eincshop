export type PaymentProviderName = "UNSELECTED";

export type CreatePaymentInput = {
  orderId: string;
  orderNumber: string;
  amountMinor: number;
  currency: string;
  customerEmail: string;
};

export type PaymentCreationResult = {
  provider: PaymentProviderName;
  providerPaymentId: string;
  checkoutUrl?: string;
};

export interface PaymentProviderAdapter {
  createPayment(
    input: CreatePaymentInput,
  ): Promise<PaymentCreationResult>;

  verifyWebhook(
    payload: string,
    signature: string,
  ): Promise<{
    valid: boolean;
    providerEventId?: string;
    status?: "PAID" | "FAILED" | "EXPIRED";
  }>;
}