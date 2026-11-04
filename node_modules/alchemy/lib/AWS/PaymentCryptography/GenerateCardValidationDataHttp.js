import * as paymentcryptographydata from "@distilled.cloud/aws/payment-cryptography-data";
import * as Layer from "effect/Layer";
import { makePaymentCryptographyKeyHttpBinding } from "./BindingHttp.js";
import { GenerateCardValidationData } from "./GenerateCardValidationData.js";
/**
 * HTTP implementation of {@link GenerateCardValidationData} — grants the
 * host Function `payment-cryptography:GenerateCardValidationData` on the CVK
 * and calls the Payment Cryptography Data API at runtime.
 */
export const GenerateCardValidationDataHttp = Layer.effect(GenerateCardValidationData, makePaymentCryptographyKeyHttpBinding({
    tag: "AWS.PaymentCryptography.GenerateCardValidationData",
    operation: paymentcryptographydata.generateCardValidationData,
    actions: ["payment-cryptography:GenerateCardValidationData"],
}));
//# sourceMappingURL=GenerateCardValidationDataHttp.js.map