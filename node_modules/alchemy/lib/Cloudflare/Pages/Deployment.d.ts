import * as pages from "@distilled.cloud/cloudflare/pages";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Pages.Deployment";
type TypeId = typeof TypeId;
declare const DeploymentFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DeploymentFailed";
} & Readonly<A>;
/**
 * Raised when a Pages deployment reaches a `failure`/`canceled` stage, or
 * does not reach a successful `deploy` stage within the bounded wait.
 */
export declare class DeploymentFailed extends DeploymentFailed_base<{
    readonly projectName: string;
    readonly deploymentId: string;
    readonly stageName: string;
    readonly stageStatus: string;
}> {
}
export interface DeploymentProps {
    /**
     * Name of the Pages project to deploy to (e.g. `project.name`).
     * Deployments are immutable and belong to exactly one project —
     * changing the project triggers a replacement.
     */
    projectName: string;
    /**
     * The branch the deployment is attributed to. Deploying to the project's
     * production branch produces a production deployment; any other branch
     * produces a preview deployment. Deployments are immutable — changing
     * the branch triggers a replacement (a new deployment).
     * @default the project's production branch
     */
    branch?: string;
}
export interface DeploymentAttributes {
    /**
     * Cloudflare-assigned UUID of the deployment.
     */
    deploymentId: string;
    /**
     * Short (8-character) id of the deployment. Forms the deployment's
     * preview URL (`<shortId>.<project>.pages.dev`).
     */
    shortId: string;
    /**
     * The Cloudflare account the project belongs to.
     */
    accountId: string;
    /**
     * Name of the Pages project the deployment belongs to.
     */
    projectName: string;
    /**
     * Whether this is a `production` or `preview` deployment, derived from
     * the branch it was created on.
     */
    environment: string;
    /**
     * The live URL serving this specific deployment.
     */
    url: string;
    /**
     * The branch the deployment was created from.
     */
    branch: string;
    /**
     * Name of the deployment's latest pipeline stage (e.g. `deploy`).
     */
    latestStageName: string;
    /**
     * Status of the deployment's latest pipeline stage (e.g. `success`).
     */
    latestStageStatus: string;
    /**
     * When the deployment was created.
     */
    createdOn: string;
}
export type Deployment = Resource<TypeId, DeploymentProps, DeploymentAttributes, never, Providers>;
/**
 * A direct-upload deployment on a Cloudflare Pages project.
 *
 * Creating the resource POSTs a new deployment to the project and waits
 * (bounded) for it to reach a successful `deploy` stage. Deployments are
 * immutable — every prop change triggers a replacement (a brand-new
 * deployment that supersedes the previous one).
 *
 * The deployment is created with an **empty asset manifest**: the full
 * direct-upload protocol (asset upload sessions driven by
 * `wrangler pages deploy`) is not part of the public REST surface, so this
 * resource cannot push file contents. It is useful for provisioning an
 * initial/placeholder deployment on a direct-upload project (so the
 * project's `*.pages.dev` subdomain starts serving) and for rolling the
 * active deployment from IaC. For deploying real static sites prefer
 * `Cloudflare.Website` (Workers Assets).
 *
 * Deleting the resource deletes the deployment (with `force`), except when
 * it is the project's active production deployment — Cloudflare refuses to
 * delete the live deployment, so delete tolerates that case and the
 * deployment is cleaned up when the project itself is deleted.
 * ### Creating a Deployment
 * **Example:** Production deployment on a direct-upload project
 * ```typescript
 * const project = yield* Cloudflare.Pages.Project("site", {});
 *
 * const deployment = yield* Cloudflare.Pages.Deployment("site-deploy", {
 *   projectName: project.name,
 * });
 * // deployment.url === "https://<shortId>.<project>.pages.dev"
 * // deployment.environment === "production"
 * ```
 *
 * **Example:** Preview deployment from a non-production branch
 * ```typescript
 * const preview = yield* Cloudflare.Pages.Deployment("site-preview", {
 *   projectName: project.name,
 *   branch: "feature-x",
 * });
 * // preview.environment === "preview"
 * ```
 *
 * @see https://developers.cloudflare.com/pages/
 *
 * @resource
 * @product Pages
 * @category Workers & Compute
 */
export declare const Deployment: import("../../Resource.ts").ResourceClass<Deployment>;
/**
 * Returns true if the given value is a Deployment resource.
 */
export declare const isDeployment: (value: unknown) => value is Deployment;
export declare const DeploymentProvider: () => import("effect/Layer").Layer<Provider.Provider<Deployment>, never, CloudflareEnvironment | pages.CloudflareOpContext>;
export {};
//# sourceMappingURL=Deployment.d.ts.map