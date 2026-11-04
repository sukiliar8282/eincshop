import * as Layer from "effect/Layer";
import { VerifyPinData } from "./VerifyPinData.ts";
/**
 * HTTP implementation of {@link VerifyPinData} — grants the host Function
 * `payment-cryptography:VerifyPinData` on both the verification key (PVK)
 * and the encryption key (PEK) and calls the Payment Cryptography Data API
 * at runtime. A PIN mismatch fails with the typed
 * `VerificationFailedException`.
 */
export declare const VerifyPinDataHttp: Layer.Layer<VerifyPinData, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=VerifyPinDataHttp.d.ts.map