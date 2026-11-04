import * as schemas from "@distilled.cloud/aws/schemas";
import * as Effect from "effect/Effect";
/**
 * Reads the observed tag map for an EventBridge Schemas resource ARN. A
 * missing resource yields `{}` so callers treat it as "no tags observed".
 */
export declare const readSchemasTags: (resourceArn: string) => Effect.Effect<Record<string, string>, schemas.BadRequestException | schemas.ForbiddenException | schemas.InternalServerErrorException | import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Reconciles the tags on a Schemas resource to `{ ...user, ...internal }`,
 * diffing against the OBSERVED cloud tags (so adoption converges). Applies
 * only the delta: `tagResource` for upserts, `untagResource` for removals.
 */
export declare const syncSchemasTags: (resourceArn: string, id: string, userTags: Record<string, string> | undefined) => Effect.Effect<void, schemas.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
/**
 * Canonicalizes a JSON document string for comparison: parses and re-stringifies
 * with recursively sorted object keys so semantically-equal documents compare
 * equal regardless of key order or whitespace. Non-JSON content is returned
 * verbatim.
 */
export declare const canonicalJson: (content: string) => string;
//# sourceMappingURL=internal.d.ts.map