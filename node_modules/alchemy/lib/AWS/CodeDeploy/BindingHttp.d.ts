import * as Effect from "effect/Effect";
import type { Application } from "./Application.ts";
import type { DeploymentGroup } from "./DeploymentGroup.ts";
/**
 * Shared scaffolding for AWS CodeDeploy HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the IAM action, and (for
 * name-injecting operations) the injected `applicationName` /
 * `deploymentGroupName` is boilerplate.
 *
 * CodeDeploy authorizes deployment-addressed operations (get/stop/continue a
 * deployment, lifecycle-hook results, deployment targets) against the
 * *deployment group* the deployment belongs to, and revision operations
 * against the *application* ARN — so every builder grants on the bound
 * resource's ARN.
 */
/**
 * Build the impl Effect for an operation whose input carries
 * `applicationName` + `deploymentGroupName` fields: the runtime callable
 * injects both from the bound {@link DeploymentGroup} and the deploy-time
 * half grants `actions` on the deployment-group ARN.
 */
export declare const makeCodeDeployGroupNameHttpBinding: <I extends {
    applicationName?: string;
    deploymentGroupName?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CodeDeploy.ListDeployments`. */
    tag: string;
    /**
     * The distilled operation; `applicationName` and `deploymentGroupName`
     * are injected from the group.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the deployment-group ARN. */
    actions: readonly string[];
}) => Effect.Effect<<G extends DeploymentGroup>(group: G) => Effect.Effect<(request?: Omit<I, "applicationName" | "deploymentGroupName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a group-anchored operation whose input
 * addresses deployments by id (get/stop/continue, lifecycle-hook results,
 * deployment targets): the request passes through as-is and the deploy-time
 * half grants `actions` on the deployment-group ARN (CodeDeploy authorizes
 * deployment-addressed operations against the group the deployment belongs
 * to).
 */
export declare const makeCodeDeployGroupHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CodeDeploy.GetDeployment`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the deployment-group ARN. */
    actions: readonly string[];
}) => Effect.Effect<<G extends DeploymentGroup>(group: G) => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an operation whose input carries an
 * `applicationName` field (revision management): the runtime callable
 * injects the bound {@link Application}'s name and the deploy-time half
 * grants `actions` on the application ARN.
 */
export declare const makeCodeDeployApplicationHttpBinding: <I extends {
    applicationName?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CodeDeploy.GetApplicationRevision`. */
    tag: string;
    /** The distilled operation; `applicationName` is injected from the app. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the application ARN. */
    actions: readonly string[];
}) => Effect.Effect<<P extends Application>(application: P) => Effect.Effect<(request?: Omit<I, "applicationName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map