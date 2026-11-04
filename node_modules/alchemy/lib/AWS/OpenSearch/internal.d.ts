import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Effect from "effect/Effect";
/**
 * Convert OpenSearch's `[{ Key, Value }]` tag list into a plain record,
 * dropping any entry missing a key or value.
 */
export declare const toTagRecord: (tags: ReadonlyArray<{
    Key?: string;
    Value?: string;
}> | undefined) => Record<string, string>;
/**
 * Read the observed tags for an OpenSearch domain by ARN. A domain that has
 * just been created (or is mid-transition) can transiently reject `listTags`;
 * treat any failure as "no observed tags" so tag reconciliation still runs.
 */
export declare const readDomainTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * True when any DEFINED leaf of `desired` differs from the corresponding
 * value in `observed`. Keys the caller left undefined are ignored, so the
 * comparison only covers configuration the user actually expressed.
 */
export declare const subsetDiffers: (desired: unknown, observed: unknown) => boolean;
/**
 * Poll an OpenSearch domain until `done` observes a settled state (bounded:
 * 15s x 120 = ~30 minutes; domain provisioning and blue/green config changes
 * typically take 15-25 minutes). If the schedule exhausts first, the last
 * observation is returned as-is so the caller sees the real (still
 * converging) domain rather than a spurious failure.
 *
 * The explicit `Effect.Effect<A, E, R>` return annotation is load-bearing:
 * inlining repeat/retry combinators in provider lifecycle code lets their
 * conditional return types survive into declaration emit and widen the
 * provider layer to `unknown` R, poisoning `AWS.providers()` downstream.
 */
export declare const repeatUntilDomainState: <E extends {
    readonly _tag: string;
}, R>(read: Effect.Effect<opensearch.DomainStatus | undefined, E, R>, done: (domain: opensearch.DomainStatus | undefined) => boolean) => Effect.Effect<opensearch.DomainStatus | undefined, E, R>;
/** A domain is active once created and no config change is being applied. */
export declare const isDomainActive: (domain: opensearch.DomainStatus | undefined) => boolean;
/** A domain can be deleted once it is no longer applying a config change. */
export declare const isDomainDeletable: (domain: opensearch.DomainStatus | undefined) => boolean;
//# sourceMappingURL=internal.d.ts.map