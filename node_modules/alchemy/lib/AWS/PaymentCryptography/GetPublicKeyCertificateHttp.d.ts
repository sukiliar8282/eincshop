import * as Layer from "effect/Layer";
import { GetPublicKeyCertificate } from "./GetPublicKeyCertificate.ts";
/**
 * HTTP implementation of {@link GetPublicKeyCertificate} — grants the host
 * Function `payment-cryptography:GetPublicKeyCertificate` on the key and
 * calls the Payment Cryptography control-plane API at runtime.
 */
export declare const GetPublicKeyCertificateHttp: Layer.Layer<GetPublicKeyCertificate, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetPublicKeyCertificateHttp.d.ts.map