import * as Layer from "effect/Layer";
import { TranslateKeyMaterial } from "./TranslateKeyMaterial.ts";
/**
 * HTTP implementation of {@link TranslateKeyMaterial} — bespoke (not
 * scaffolded): the key identifiers live in nested request structures
 * (`IncomingKeyMaterial.DiffieHellmanTr31KeyBlock.PrivateKeyIdentifier`,
 * `OutgoingKeyMaterial.Tr31KeyBlock.WrappingKeyIdentifier`) whose union arms
 * vary by exchange scheme, so nothing is injected. The deploy-time half
 * grants `payment-cryptography:TranslateKeyMaterial` on every bound
 * {@link Key}; the caller supplies the full request (resolving each key's
 * ARN itself).
 */
export declare const TranslateKeyMaterialHttp: Layer.Layer<TranslateKeyMaterial, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=TranslateKeyMaterialHttp.d.ts.map