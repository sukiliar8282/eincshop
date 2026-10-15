import type {
  CreatePaymentInput,
  PaymentCreationResult,
  PaymentProviderAdapter,
} from "./contract";

export const unconfiguredPaymentProvider: PaymentProviderAdapter = {
  async createPayment(
    _input: CreatePaymentInput,
  ): Promise<PaymentCreationResult> {
    throw new Error("Payment provider belum dikonfigurasi.");
  },

  async verifyWebhook() {
    throw new Error("Payment provider belum dikonfigurasi.");
  },
};
