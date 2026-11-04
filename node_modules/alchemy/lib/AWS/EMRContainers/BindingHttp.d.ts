import * as Effect from "effect/Effect";
import * as Output from "../../Output.ts";
import type { JobTemplate } from "./JobTemplate.ts";
import type { VirtualCluster } from "./VirtualCluster.ts";
/**
 * Shared scaffolding for Amazon EMR on EKS (`emr-containers`) HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the identifier injection, and the
 * IAM action list is boilerplate.
 *
 * EMR on EKS authorizes virtual-cluster-addressed actions against the
 * virtual cluster ARN (`arn:…:/virtualclusters/vc-id`) and sub-resource
 * actions (job runs, managed endpoints) against child ARNs
 * (`…/virtualclusters/vc-id/jobruns/id`, `…/endpoints/id`), so the
 * virtual-cluster builders grant on both the bound cluster's ARN and its
 * sub-resource pattern.
 */
export declare const virtualClusterPolicyStatement: (virtualCluster: VirtualCluster, actions: readonly string[]) => {
    Effect: "Allow";
    Action: string[];
    Resource: Output.Output<string, never>[];
};
/**
 * Build the impl Effect for an operation whose input carries a
 * `virtualClusterId` field: the runtime callable injects the bound
 * {@link VirtualCluster}'s ID and the deploy-time half grants `actions` on
 * the virtual cluster ARN (and its sub-resource pattern).
 */
export declare const makeEMRContainersVirtualClusterHttpBinding: <I extends {
    virtualClusterId?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.EMRContainers.StartJobRun`. */
    tag: string;
    /** The distilled operation; `virtualClusterId` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the virtual cluster ARN + sub-resource pattern. */
    actions: readonly string[];
}) => Effect.Effect<(virtualCluster: VirtualCluster) => Effect.Effect<(request?: Omit<I, "virtualClusterId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an operation whose input carries an `id` field
 * addressing a {@link JobTemplate}: the runtime callable injects the bound
 * template's ID and the deploy-time half grants `actions` on the template
 * ARN.
 */
export declare const makeEMRContainersJobTemplateHttpBinding: <I extends {
    id?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.EMRContainers.DescribeJobTemplate`. */
    tag: string;
    /** The distilled operation; the template `id` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the job template ARN. */
    actions: readonly string[];
}) => Effect.Effect<(template: JobTemplate) => Effect.Effect<(request?: Omit<I, "id"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level operation (e.g. enumerating the
 * account's job templates). The deploy-time half grants `actions` on `*` —
 * account-level list actions are not scoped to a single resource.
 */
export declare const makeEMRContainersAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.EMRContainers.ListJobTemplates`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map