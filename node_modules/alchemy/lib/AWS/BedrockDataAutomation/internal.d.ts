import * as bda from "@distilled.cloud/aws/bedrock-data-automation";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
/**
 * Unwrap a Bedrock Data Automation `SensitiveString` (decoded as `Redacted`)
 * to its plain string value. `String(redacted)` would yield `"<redacted>"`,
 * not the value.
 */
export declare const unredact: (value: string | Redacted.Redacted<string>) => string;
/**
 * Coerce a Bedrock Data Automation wire tag list (`{ key, value }[]`) into a
 * plain `Record<string, string>`.
 */
export declare const toBdaTagRecord: (tags: bda.Tag[] | undefined) => Record<string, string>;
/**
 * Coerce a plain tag record into the Bedrock Data Automation wire tag list
 * (`{ key, value }[]`).
 */
export declare const toBdaTagList: (tags: Record<string, string>) => bda.Tag[];
/**
 * Read the observed tags of a Bedrock Data Automation resource by ARN. A
 * missing resource (race with deletion) reports no tags.
 */
export declare const readBdaTags: (resourceARN: string) => Effect.Effect<Record<string, string>, bda.AccessDeniedException | bda.InternalServerException | bda.ThrottlingException | bda.ValidationException | import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a Bedrock Data Automation resource: diff the OBSERVED cloud
 * tags against the desired set and apply only the delta.
 */
export declare const syncBdaTags: (resourceARN: string, desiredTags: Record<string, string>) => Effect.Effect<void, bda.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Key-order-independent structural equality for configuration objects, used
 * to diff observed cloud configuration against the desired props. The server
 * may fill defaulted fields the user never specified — a mismatch then just
 * re-applies the idempotent PUT.
 */
export declare const bdaConfigEquals: (a: unknown, b: unknown) => boolean;
//# sourceMappingURL=internal.d.ts.map