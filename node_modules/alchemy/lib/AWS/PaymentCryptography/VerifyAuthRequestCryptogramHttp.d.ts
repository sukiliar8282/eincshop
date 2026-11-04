import * as Layer from "effect/Layer";
import { VerifyAuthRequestCryptogram } from "./VerifyAuthRequestCryptogram.ts";
/**
 * HTTP implementation of {@link VerifyAuthRequestCryptogram} — grants the
 * host Function `payment-cryptography:VerifyAuthRequestCryptogram` on the
 * issuer master key and calls the Payment Cryptography Data API at runtime.
 * A cryptogram mismatch fails with the typed `VerificationFailedException`.
 */
export declare const VerifyAuthRequestCryptogramHttp: Layer.Layer<VerifyAuthRequestCryptogram, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=VerifyAuthRequestCryptogramHttp.d.ts.map