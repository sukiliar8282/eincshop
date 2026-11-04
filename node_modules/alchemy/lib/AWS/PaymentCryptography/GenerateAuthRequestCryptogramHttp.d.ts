import * as Layer from "effect/Layer";
import { GenerateAuthRequestCryptogram } from "./GenerateAuthRequestCryptogram.ts";
/**
 * HTTP implementation of {@link GenerateAuthRequestCryptogram} — grants the
 * host Function `payment-cryptography:GenerateAuthRequestCryptogram` on the
 * issuer master key and calls the Payment Cryptography Data API at runtime.
 */
export declare const GenerateAuthRequestCryptogramHttp: Layer.Layer<GenerateAuthRequestCryptogram, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GenerateAuthRequestCryptogramHttp.d.ts.map