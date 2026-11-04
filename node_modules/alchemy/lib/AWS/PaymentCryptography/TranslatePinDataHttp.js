import * as paymentcryptographydata from "@distilled.cloud/aws/payment-cryptography-data";
import * as Layer from "effect/Layer";
import { makePaymentCryptographyKeyPairHttpBinding } from "./BindingHttp.js";
import { TranslatePinData } from "./TranslatePinData.js";
/**
 * HTTP implementation of {@link TranslatePinData} — grants the host Function
 * `payment-cryptography:TranslatePinData` on both the incoming and outgoing
 * PIN encryption keys and calls the Payment Cryptography Data API at
 * runtime.
 */
export const TranslatePinDataHttp = Layer.effect(TranslatePinData, makePaymentCryptographyKeyPairHttpBinding({
    tag: "AWS.PaymentCryptography.TranslatePinData",
    operation: paymentcryptographydata.translatePinData,
    actions: ["payment-cryptography:TranslatePinData"],
    keyFields: ["IncomingKeyIdentifier", "OutgoingKeyIdentifier"],
}));
//# sourceMappingURL=TranslatePinDataHttp.js.map