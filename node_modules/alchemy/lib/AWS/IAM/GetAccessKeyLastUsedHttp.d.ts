import * as Layer from "effect/Layer";
import { GetAccessKeyLastUsed } from "./GetAccessKeyLastUsed.ts";
/**
 * Bespoke (resource-bound) IAM HTTP binding: unlike the account-level
 * bindings built on `makeIamHttpBinding`, this one binds a canonical
 * {@link AccessKey} and injects its `AccessKeyId` into every request.
 */
export declare const GetAccessKeyLastUsedHttp: Layer.Layer<GetAccessKeyLastUsed, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetAccessKeyLastUsedHttp.d.ts.map