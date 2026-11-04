import * as forecast from "@distilled.cloud/aws/forecast";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
/**
 * Unwrap a Forecast `SensitiveString` (decoded as `Redacted`) to its plain
 * string value. `String(redacted)` would yield `"<redacted>"`, not the value.
 */
export declare const unredact: (value: string | Redacted.Redacted<string>) => string;
/**
 * Coerce a Forecast wire tag list (`{ Key, Value }[]`, values decode as
 * `Redacted`) into a plain `Record<string, string>`.
 */
export declare const toTagRecord: (tags: forecast.Tag[] | undefined) => Record<string, string>;
/**
 * Read the observed tags of a Forecast resource by ARN. Tag reads are
 * best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readForecastTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a Forecast resource: diff the OBSERVED cloud tags against the
 * desired set and apply only the delta.
 */
export declare const syncForecastTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, forecast.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Coerce a generated physical name into Forecast's identifier constraint
 * (`^[a-zA-Z][a-zA-Z0-9_]*` — underscores only, must start with a letter).
 * `createPhysicalName` emits DNS-style hyphens, which Forecast rejects.
 */
export declare const toForecastName: (name: string) => string;
//# sourceMappingURL=internal.d.ts.map