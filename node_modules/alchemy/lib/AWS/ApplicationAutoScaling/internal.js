import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
/**
 * Known Application Auto Scaling service namespaces, used by `list()` to
 * enumerate account-wide state. `DescribeScalableTargets` (and the policy /
 * scheduled-action describes) require a `ServiceNamespace` filter, so an
 * account-wide enumeration is the union of the per-namespace enumerations.
 * The wire type is open (`string & {}`) but AWS only ever returns members of
 * this set; new namespaces are appended when AWS ships them.
 */
export const SERVICE_NAMESPACES = [
    "ecs",
    "elasticmapreduce",
    "ec2",
    "appstream",
    "dynamodb",
    "rds",
    "sagemaker",
    "custom-resource",
    "comprehend",
    "lambda",
    "cassandra",
    "kafka",
    "elasticache",
    "neptune",
    "workspaces",
];
/**
 * `RegisterScalableTarget` is eventually consistent: a `PutScalingPolicy` /
 * `PutScheduledAction` issued immediately after registration can fail with
 * `ObjectNotFoundException` until the target propagates. Retry that typed tag
 * on a short bounded schedule (~20s total).
 *
 * NOTE: the explicit `Effect.Effect<A, E, R>` return annotation is
 * load-bearing — an inlined `Effect.retry` leaks `Retry.Return`'s conditional
 * type into declaration emit and widens the provider layer to
 * `Layer<..., never, unknown>` for downstream consumers.
 */
export const retryWhileTargetPropagates = (self) => Effect.retry(self, {
    while: (e) => e._tag === "ObjectNotFoundException",
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(10)]),
});
//# sourceMappingURL=internal.js.map