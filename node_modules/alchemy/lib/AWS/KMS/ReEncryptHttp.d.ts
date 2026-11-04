import * as Layer from "effect/Layer";
import { ReEncrypt } from "./ReEncrypt.ts";
/**
 * Bespoke (not scaffolded): ReEncrypt spans two keys — `kms:ReEncryptTo` on
 * the destination and `kms:ReEncryptFrom` on the source — and injects
 * `DestinationKeyId` (plus `SourceKeyId` when a source key is bound).
 */
export declare const ReEncryptHttp: Layer.Layer<ReEncrypt, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ReEncryptHttp.d.ts.map