import * as paymentcryptography from "@distilled.cloud/aws/payment-cryptography";
import * as Layer from "effect/Layer";
import { makePaymentCryptographyKeyHttpBinding } from "./BindingHttp.js";
import { GetPublicKeyCertificate } from "./GetPublicKeyCertificate.js";
/**
 * HTTP implementation of {@link GetPublicKeyCertificate} — grants the host
 * Function `payment-cryptography:GetPublicKeyCertificate` on the key and
 * calls the Payment Cryptography control-plane API at runtime.
 */
export const GetPublicKeyCertificateHttp = Layer.effect(GetPublicKeyCertificate, makePaymentCryptographyKeyHttpBinding({
    tag: "AWS.PaymentCryptography.GetPublicKeyCertificate",
    operation: paymentcryptography.getPublicKeyCertificate,
    actions: ["payment-cryptography:GetPublicKeyCertificate"],
}));
//# sourceMappingURL=GetPublicKeyCertificateHttp.js.map