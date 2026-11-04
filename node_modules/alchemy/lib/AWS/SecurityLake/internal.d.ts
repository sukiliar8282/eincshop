import * as securitylake from "@distilled.cloud/aws/securitylake";
import * as Effect from "effect/Effect";
/**
 * Security Lake tags use lowercase `{ key, value }` wire members (unlike most
 * AWS services' `{ Key, Value }`), so the generic Tags.ts converters don't
 * apply directly.
 */
export declare const toTagList: (tags: Record<string, string>) => securitylake.Tag[];
export declare const fromTagList: (tags: readonly securitylake.Tag[] | undefined) => Record<string, string>;
/** Observed cloud tags for a Security Lake resource ARN ({} on any failure). */
export declare const readSecurityLakeTags: (resourceArn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Bounded retry through transient `ConflictException`s (e.g. a subscriber or
 * data-lake mutation racing an in-flight update). Explicitly annotated so the
 * `Retry.Return` conditional never leaks into declaration emit.
 */
export declare const retryWhileConflict: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
//# sourceMappingURL=internal.d.ts.map