import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
/**
 * Unwrap a distilled `SensitiveString` (`string | Redacted<string>`) into a
 * plain string, preserving `undefined`.
 */
export declare const unwrapSensitive: (value: string | Redacted.Redacted<string> | undefined) => string | undefined;
/**
 * Convert the wire `TagsMap` (`Record<string, string | undefined>`) into a
 * plain `Record<string, string>`, dropping entries without a value.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Reconcile the tags on an IoT Managed Integrations resource identified by
 * ARN: diff OBSERVED cloud tags against the desired set and apply only the
 * delta via tagResource/untagResource.
 */
export declare const syncManagedIntegrationsTags: (resourceArn: string, observedTags: Record<string, string>, desiredTags: Record<string, string>) => Effect.Effect<void, mi.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map