import * as osis from "@distilled.cloud/aws/osis";
import * as Effect from "effect/Effect";
/**
 * Convert OSIS's `[{ Key, Value }]` tag list into a plain record, dropping
 * any entry missing a key or value.
 */
export declare const toTagRecord: (tags: ReadonlyArray<{
    Key?: string;
    Value?: string;
}> | undefined) => Record<string, string>;
/**
 * Read the observed tags for an OSIS pipeline by ARN. A pipeline that has
 * just been created (or is mid-transition) can transiently reject the call;
 * treat any failure as "no observed tags" so tag reconciliation still runs.
 */
export declare const readPipelineTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
declare const PipelineOperationFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "OsisPipelineOperationFailed";
} & Readonly<A>;
/**
 * An OSIS pipeline whose asynchronous create/update converged to a
 * `*_FAILED` status.
 */
export declare class PipelineOperationFailed extends PipelineOperationFailed_base<{
    readonly pipelineName: string;
    readonly status: string;
    readonly reason: string | undefined;
}> {
}
/**
 * Poll an OSIS pipeline until its `Status` reaches a terminal value
 * (bounded: 15s x 60 = ~15 minutes; pipeline creation typically takes 5-10
 * minutes). `*_FAILED` fails immediately with the status reason. If the
 * bounded schedule exhausts while still transitional, the last observation
 * is returned as-is so the caller sees the real (still-converging) pipeline
 * rather than a spurious failure.
 *
 * The explicit `Effect.Effect<A, E, R>` return annotation is load-bearing:
 * inlining repeat/retry combinators in provider lifecycle code lets their
 * conditional return types survive into declaration emit and widen the
 * provider layer to `unknown` R, poisoning `AWS.providers()` downstream.
 */
export declare const waitForPipelineSettled: <E extends {
    readonly _tag: string;
}, R>(pipelineName: string, read: Effect.Effect<osis.Pipeline | undefined, E, R>) => Effect.Effect<osis.Pipeline | undefined, E | PipelineOperationFailed, R>;
/**
 * Retry an effect while OSIS reports `ConflictException` — raised when a
 * delete/update races an in-flight state transition. Bounded: 15s x 20.
 */
export declare const retryWhilePipelineConflict: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/** Structural deep equality over JSON-shaped values (order-insensitive keys). */
export declare const jsonEquals: (a: unknown, b: unknown) => boolean;
export {};
//# sourceMappingURL=internal.d.ts.map