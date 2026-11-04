import * as Layer from "effect/Layer";
import { EncryptData } from "./EncryptData.ts";
/**
 * HTTP implementation of {@link EncryptData} — grants the host Function
 * `payment-cryptography:EncryptData` on the key and calls the
 * Payment Cryptography Data API at runtime.
 * @example Provide on a Lambda Function
 * ```typescript
 * Effect.gen(function* () {
 *   const key = yield* PaymentCryptography.Key("DataKey", { ... });
 *   const encrypt = yield* PaymentCryptography.EncryptData(key);
 *
 *   return {
 *     fetch: Effect.gen(function* () {
 *       const encrypted = yield* encrypt({
 *         PlainText: plainTextHex,
 *         EncryptionAttributes: {
 *           Symmetric: { Mode: "CBC", InitializationVector: iv },
 *         },
 *       });
 *       // ...
 *     }),
 *   };
 * }).pipe(Effect.provide(PaymentCryptography.EncryptDataHttp))
 * ```
 */
export declare const EncryptDataHttp: Layer.Layer<EncryptData, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=EncryptDataHttp.d.ts.map