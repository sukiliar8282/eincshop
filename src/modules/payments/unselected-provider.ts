import type {
  CreatePaymentInput,
  PaymentCreationResult,
  PaymentProviderAdapter,
} from "./contract";

export const unselectedPaymentProvider: PaymentProviderAdapter = {
  async createPayment(
    _input: CreatePaymentInput,
  ): Promise<PaymentCreationResult> {
    return {
      provider: "UNSELECTED",
      providerPaymentId: "pending-provider-selection",
    };
  },

  async verifyWebhook() {
    throw new Error("Payment provider belum dipilih.");
  },
};
