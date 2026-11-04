import { Region as AwsRegion } from "@distilled.cloud/aws/Region";
import * as kvs from "@distilled.cloud/aws/cloudfront-keyvaluestore";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
export declare const KVS_REGION: "us-east-1";
export declare const extractValue: (v: string | Redacted.Redacted<string>) => string;
export declare const withKvsRegion: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, Exclude<R, AwsRegion>>;
export declare const withKvsRegionFn: <Args extends any[], A, E, R>(fn: (...args: Args) => Effect.Effect<A, E, R>) => (...args: Args) => Effect.Effect<A, E, Exclude<R, AwsRegion>>;
/**
 * Bounded KVS retry: exponential backoff with the per-attempt delay capped
 * at 2s and at most 24 recurrences (~45s worst case). NEVER use a bare
 * `Schedule.max([Schedule.exponential(...), Schedule.recurs(n)])` for KVS
 * retries — `recurs` bounds the COUNT, not the TIME, and an uncapped
 * exponential makes the tail attempts wait minutes-to-hours (24 attempts
 * at 100ms doubling total ~19 days), which reads as a silent hang.
 */
export declare const cappedKvsRetrySchedule: Schedule.Schedule<Duration.Duration, unknown, never, never>;
export declare const retryForKvsReadiness: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
export declare const getKvsEtag: (store: string) => Effect.Effect<string, kvs.DescribeKeyValueStoreError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export declare const isKvsPreconditionFailed: (err: kvs.ValidationException) => boolean;
//# sourceMappingURL=common.d.ts.map