/** @effect-diagnostics anyUnknownInErrorContext:off */
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import { type PlanStatusSession } from "./Report.ts";
import type { Plan } from "./Plan.ts";
import { State } from "./State/index.ts";
import { type ResourceOp } from "./Telemetry/Metrics.ts";
/**
 * The outcome of checking or repairing drift for a single resource.
 *
 * - `unchanged` — the observed cloud state matches the persisted attributes.
 * - `drifted`   — (dry-run only) the cloud state diverged from the persisted
 *                 attributes; a non-dry-run drift would repair it.
 * - `missing`   — (dry-run only) the resource no longer exists in the cloud;
 *                 a non-dry-run drift would recreate it.
 * - `repaired`  — drift was detected and the resource was reconciled back to
 *                 its desired (last-deployed) state.
 * - `recreated` — the resource was missing from the cloud and was reconciled
 *                 from scratch, reusing the persisted instance id so
 *                 deterministic physical names converge to the same values.
 * - `skipped`   — the resource was not checked; see `reason` (provider has no
 *                 `read`, or the persisted status is not stable).
 */
export type DriftAction = "unchanged" | "drifted" | "missing" | "repaired" | "recreated" | "skipped";
export interface DriftResourceResult {
    fqn: string;
    logicalId: string;
    resourceType: string;
    action: DriftAction;
    /** Why the resource was skipped (only set when `action === "skipped"`). */
    reason?: string;
    /**
     * The resource's attributes after the drift: the reconciled attributes for
     * `repaired`/`recreated`, the observed cloud attributes for `drifted`, and
     * the persisted attributes for `unchanged`. Unset for `missing`/`skipped`.
     */
    attr?: any;
}
export interface DriftResult {
    resources: Record<string, DriftResourceResult>;
}
export interface DriftOptions {
    /** Optional progress session (the CLI passes one; tests usually don't). */
    session?: PlanStatusSession;
}
declare const DriftResourceError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "DriftResourceError";
} & Readonly<A>;
/** A provider lifecycle failure annotated with the resource being checked. */
export declare class DriftResourceError extends DriftResourceError_base<{
    readonly message: string;
    readonly fqn: string;
    readonly logicalId: string;
    readonly resourceType: string;
    readonly operation: ResourceOp;
    readonly cause: unknown;
}> {
}
/** Detect drift without reconciling resources or updating state. */
export declare const detect: (stack: {
    name: string;
    stage: string;
}) => Effect.Effect<DriftResult, any, State>;
/** Reconcile resources back to their last-deployed desired state. */
export declare const repair: (stack: {
    name: string;
    stage: string;
}, options?: DriftOptions) => Effect.Effect<DriftResult, any, State>;
export interface DriftPlan {
    /** Per-resource detection outcome (a dry-run {@link DriftResult}). */
    result: DriftResult;
    /**
     * The detection outcome projected onto the engine's {@link Plan} shape so
     * the CLI renders a drift exactly like a deploy plan (ink TUI when
     * interactive, plain logging otherwise): `drifted` → `update`, `missing` →
     * `create`, `unchanged`/`skipped` → `noop`.
     */
    plan: Plan;
}
/**
 * Run the drift-detection pass and project the
 * outcome onto a {@link Plan} for display/approval. The plan is a read-only
 * view — {@link repair} re-observes the cloud rather than trusting the
 * detection snapshot.
 */
export declare const plan: (stack: {
    name: string;
    stage: string;
}) => Effect.Effect<DriftPlan, any, State>;
export {};
//# sourceMappingURL=Drift.d.ts.map