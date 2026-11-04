import * as iot from "@distilled.cloud/aws/iot";
import * as Effect from "effect/Effect";
/**
 * IoT rule names accept only `[a-zA-Z0-9_]`. Coerce any other character
 * (hyphens from generated physical names, colons, etc.) to an underscore so
 * a name derived from the stack/id/stage is always valid.
 */
export declare const sanitizeRuleName: (name: string) => string;
/**
 * Reads the observed tag map for an IoT resource ARN. A missing resource
 * yields `{}` so callers treat it as "no tags observed".
 */
export declare const readIotTags: (resourceArn: string) => Effect.Effect<Record<string, string>, iot.InternalFailureException | iot.InvalidRequestException | iot.ThrottlingException | import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Reconciles the tags on an IoT resource to `{ ...user, ...internal }`,
 * diffing against the OBSERVED cloud tags (so adoption converges). Applies
 * only the delta: `tagResource` for upserts, `untagResource` for removals.
 */
export declare const syncIotTags: (resourceArn: string, id: string, userTags: Record<string, string> | undefined) => Effect.Effect<void, iot.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=internal.d.ts.map