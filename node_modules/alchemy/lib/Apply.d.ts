import * as Cause from "effect/Cause";
import type { ConfigError } from "effect/Config";
import * as Effect from "effect/Effect";
import type { PlatformError } from "effect/PlatformError";
import type { Simplify } from "effect/Types";
import type { AuthError, NeedsReauth } from "./Auth/AuthProvider.ts";
import { type CredentialsRequired } from "./Auth/Demand.ts";
import { type PlanDisplayOptions, type PlanStatusSession } from "./Report.ts";
import type { Input } from "./Input.ts";
import * as Output from "./Output.ts";
import { type Delete, type Plan } from "./Plan.ts";
import { Stack } from "./Stack.ts";
import { Stage } from "./Stage.ts";
import { State, StateStoreError } from "./State/index.ts";
export type AppliedPlan<P extends Plan> = {
    [id in keyof P["resources"]]: P["resources"][id] extends Delete | undefined | never ? never : Simplify<P["resources"][id]["resource"]["attr"]>;
};
export interface ApplyOptions {
    planDisplay?: PlanDisplayOptions;
    /** Structured event sink for non-CLI callers. */
    session?: PlanStatusSession;
}
export declare const apply: <P extends Plan>(plan: P, options?: ApplyOptions) => Effect.Effect<Input.Resolve<P["output"]>, Output.InvalidReferenceError | Output.MissingSourceError | StateStoreError | DestroyError | CredentialsRequired | AuthError | NeedsReauth | PlatformError | ConfigError, State | Stack | Stage>;
/** A provider delete (or its attr-recovery read / state commit) that failed. */
export interface DeleteFailure {
    fqn: string;
    logicalId: string;
    resourceType: string;
    cause: Cause.Cause<unknown>;
}
/**
 * A delete that was never attempted because a dependent's delete failed (or
 * was itself blocked). The resource may legitimately be undeletable while its
 * dependents still exist, so skipping is not an error in its own right.
 */
export interface BlockedDelete {
    fqn: string;
    logicalId: string;
    resourceType: string;
    /** FQNs of the dependents whose failed/blocked deletes block this one. */
    blockedBy: string[];
}
declare const DestroyError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => Cause.YieldableError & {
    readonly _tag: "DestroyError";
} & Readonly<A>;
/**
 * Aggregate raised at the end of the deletion phase when one or more
 * resource deletes failed. Every resource whose delete did not depend on a
 * failed one was still attempted — a single failure no longer strands
 * unrelated siblings.
 */
export declare class DestroyError extends DestroyError_base<{
    failures: ReadonlyArray<DeleteFailure>;
    blocked: ReadonlyArray<BlockedDelete>;
}> {
    get message(): string;
}
export {};
//# sourceMappingURL=Apply.d.ts.map