import * as Effect from "effect/Effect";
import type { Stage } from "./Stage.ts";
/**
 * Shared scaffolding for Amazon IVS Real-Time HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeIvsRealtime…HttpBinding({ … }))` over one of the
 * builders below. Everything except the operation, the IAM action list, and
 * an optional request-shape mapper is boilerplate.
 */
/**
 * Compositions are addressed by server-generated ARNs only known at runtime,
 * so composition-plane grants use this wildcard.
 */
export declare const COMPOSITION_ARN_WILDCARD = "arn:aws:ivs:*:*:composition/*";
/**
 * Encoder configurations referenced by a composition's destinations are
 * runtime data, so StartComposition grants include this wildcard.
 */
export declare const ENCODER_CONFIGURATION_ARN_WILDCARD = "arn:aws:ivs:*:*:encoder-configuration/*";
/**
 * Storage configurations referenced by a composition's S3 destinations are
 * runtime data, so StartComposition grants include this wildcard.
 */
export declare const STORAGE_CONFIGURATION_ARN_WILDCARD = "arn:aws:ivs:*:*:storage-configuration/*";
/**
 * Build the impl Effect for an IVS Real-Time operation scoped to a
 * {@link Stage}: the deploy-time half grants `actions` on the bound stage's
 * ARN (plus any `extraResources`), and the runtime half injects the stage's
 * ARN under `requestKey` (default `stageArn`; `ListParticipantReplicas`
 * addresses the stage as `sourceStageArn`).
 *
 * `prepare` (optional) maps a friendlier public request shape onto the wire
 * request — e.g. `CreateParticipantToken` converts a `Duration.Input` into
 * the wire `duration` minutes. It defaults to identity.
 */
export declare const makeIvsRealtimeStageHttpBinding: <I extends { [P in K]: string; }, A, E, R, K extends string = "stageArn", Req = Omit<I, K>>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.IVSRealtime.CreateParticipantToken`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the stage ARN. */
    actions: readonly string[];
    /** Request field carrying the bound stage's ARN. @default "stageArn" */
    requestKey?: K;
    /** Static IAM resources granted in addition to the stage ARN. */
    extraResources?: readonly string[];
    /** Map the public request shape to the wire request (defaults to identity). */
    prepare?: (request: Req) => Omit<I, K>;
}) => Effect.Effect<(stage: Stage) => Effect.Effect<(request?: Req | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an IVS Real-Time participant-replication
 * operation: the runtime callable is bound to a **source** and a
 * **destination** {@link Stage}, injects both ARNs, and the deploy-time half
 * grants `actions` on both stage ARNs.
 */
export declare const makeIvsRealtimeReplicationHttpBinding: <I extends {
    sourceStageArn: string;
    destinationStageArn: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.IVSRealtime.StartParticipantReplication`. */
    tag: string;
    /** The distilled operation; both stage ARNs are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on both stage ARNs. */
    actions: readonly string[];
}) => Effect.Effect<(sourceStage: Stage, destinationStage: Stage) => Effect.Effect<(request: Omit<I, "destinationStageArn" | "sourceStageArn">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level IVS Real-Time operation
 * (composition management — compositions are addressed by server-generated
 * ARNs that are runtime data). The deploy-time half grants `actions` on
 * `resources` (default `*`).
 */
export declare const makeIvsRealtimeAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.IVSRealtime.ListCompositions`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted. */
    actions: readonly string[];
    /**
     * IAM resources the actions are granted on.
     * @default ["*"]
     */
    resources?: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map