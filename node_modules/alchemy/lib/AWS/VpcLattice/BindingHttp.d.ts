import * as Effect from "effect/Effect";
import type { TargetGroup } from "./TargetGroup.ts";
/**
 * Shared scaffolding for the VPC Lattice runtime bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeVpcLatticeTargetGroupHttpBinding({ … }))` over
 * the builder below. Everything except the operation, the IAM action list,
 * and the injected `targetGroupIdentifier` is boilerplate.
 */
/**
 * Build the impl Effect for a target-group-scoped VPC Lattice operation: the
 * runtime callable injects the bound {@link TargetGroup}'s ID as
 * `targetGroupIdentifier` and the deploy-time half grants `actions` on the
 * target group's ARN.
 */
export declare const makeVpcLatticeTargetGroupHttpBinding: <I extends {
    targetGroupIdentifier?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.VpcLattice.ListTargets`. */
    tag: string;
    /**
     * The distilled operation; `targetGroupIdentifier` is injected from the
     * target group.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the target group ARN. */
    actions: readonly string[];
}) => Effect.Effect<(targetGroup: TargetGroup) => Effect.Effect<(request: Omit<I, "targetGroupIdentifier">) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map