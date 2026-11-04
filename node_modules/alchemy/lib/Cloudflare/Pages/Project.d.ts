import * as pages from "@distilled.cloud/cloudflare/pages";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Pages.Project";
type TypeId = typeof TypeId;
/**
 * Build configuration for a Pages project. All fields are mutable in place.
 */
export interface BuildConfig {
    /**
     * Enable build caching for the project.
     */
    buildCaching?: boolean;
    /**
     * Command used to build the project (e.g. `npm run build`).
     */
    buildCommand?: string;
    /**
     * Output directory of the build, relative to `rootDir` (e.g. `dist`).
     */
    destinationDir?: string;
    /**
     * Directory to run the build command in. Defaults to the repository root.
     */
    rootDir?: string;
}
/**
 * A single environment variable on a Pages deployment environment.
 */
export interface EnvVar {
    /**
     * Whether the value is stored as plain text or encrypted as a secret.
     * @default "plain_text"
     */
    type?: "plain_text" | "secret_text";
    /**
     * The environment variable value.
     */
    value: string;
}
/**
 * Per-environment (preview / production) deployment configuration.
 *
 * Record-shaped fields (`envVars`, `kvNamespaces`, `d1Databases`,
 * `r2Buckets`) are reconciled key-by-key: Cloudflare's PATCH endpoint
 * deep-merges, so keys observed on the project but absent from the desired
 * config are explicitly removed.
 */
export interface DeploymentConfig {
    /**
     * Environment variables, keyed by variable name.
     */
    envVars?: Record<string, EnvVar>;
    /**
     * KV namespace bindings, keyed by binding name. The value is the KV
     * namespace id (e.g. `kvNamespace.namespaceId`).
     */
    kvNamespaces?: Record<string, string>;
    /**
     * D1 database bindings, keyed by binding name. The value is the D1
     * database UUID (e.g. `database.databaseId`).
     */
    d1Databases?: Record<string, string>;
    /**
     * R2 bucket bindings, keyed by binding name. The value is the bucket
     * name (e.g. `bucket.bucketName`).
     */
    r2Buckets?: Record<string, string>;
    /**
     * Compatibility date used by Pages Functions (e.g. `2025-01-01`).
     */
    compatibilityDate?: string;
    /**
     * Compatibility flags used by Pages Functions.
     */
    compatibilityFlags?: string[];
    /**
     * Whether requests are served (`true`) or rejected (`false`) when a
     * Pages Function exceeds its limits.
     */
    failOpen?: boolean;
    /**
     * Placement settings for Pages Functions (e.g. `{ mode: "smart" }`).
     */
    placement?: {
        mode: string;
    };
}
/**
 * Deployment configuration for both Pages environments.
 */
export interface DeploymentConfigs {
    /**
     * Configuration applied to preview (non-production-branch) deployments.
     */
    preview?: DeploymentConfig;
    /**
     * Configuration applied to production deployments.
     */
    production?: DeploymentConfig;
}
export interface ProjectProps {
    /**
     * Name of the project. Forms the `<name>.pages.dev` subdomain, so it must
     * be unique across all of Cloudflare Pages and contain only lowercase
     * letters, numbers, and dashes. The name is the project's identity —
     * changing it triggers a replacement.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Production branch of the project. Deployments to this branch are
     * production deployments; any other branch produces a preview deployment.
     * Mutable in place.
     * @default "main"
     */
    productionBranch?: string;
    /**
     * Configs for the project build process. Mutable in place.
     */
    buildConfig?: BuildConfig;
    /**
     * Per-environment deployment configuration (env vars, bindings,
     * compatibility settings). Mutable in place.
     */
    deploymentConfigs?: DeploymentConfigs;
}
export interface ProjectAttributes {
    /**
     * Cloudflare-assigned UUID of the project.
     */
    projectId: string;
    /**
     * The Cloudflare account the project belongs to.
     */
    accountId: string;
    /**
     * Name of the project.
     */
    name: string;
    /**
     * The `*.pages.dev` subdomain serving the project (e.g.
     * `my-project.pages.dev`).
     */
    subdomain: string;
    /**
     * All domains attached to the project, including the `*.pages.dev`
     * subdomain and any custom domains.
     */
    domains: string[];
    /**
     * Production branch of the project.
     */
    productionBranch: string;
    /**
     * When the project was created.
     */
    createdOn: string;
}
export type Project = Resource<TypeId, ProjectProps, ProjectAttributes, never, Providers>;
/**
 * A Cloudflare Pages project (direct-upload).
 *
 * The project is the container for Pages deployments, custom domains, and
 * per-environment configuration. Created without git `source` integration,
 * it is a direct-upload project — deployments are pushed via the API or
 * `wrangler pages deploy`.
 *
 * The project `name` is its identity (it forms the `<name>.pages.dev`
 * subdomain), so renaming triggers a replacement. `productionBranch`,
 * `buildConfig`, and `deploymentConfigs` are all mutable in place.
 * ### Creating a Project
 * **Example:** Minimal project (generated name)
 * ```typescript
 * const project = yield* Cloudflare.Pages.Project("site", {});
 * // project.subdomain === "<generated-name>.pages.dev"
 * ```
 *
 * **Example:** Named project with a build config
 * ```typescript
 * const project = yield* Cloudflare.Pages.Project("site", {
 *   name: "my-site",
 *   productionBranch: "main",
 *   buildConfig: {
 *     buildCommand: "npm run build",
 *     destinationDir: "dist",
 *   },
 * });
 * ```
 *
 * ### Deployment Configuration
 * **Example:** Environment variables and bindings
 * ```typescript
 * const project = yield* Cloudflare.Pages.Project("site", {
 *   deploymentConfigs: {
 *     production: {
 *       compatibilityDate: "2026-08-31",
 *       envVars: {
 *         API_URL: { value: "https://api.example.com" },
 *         API_KEY: { type: "secret_text", value: apiKey },
 *       },
 *       kvNamespaces: {
 *         CACHE: kvNamespace.namespaceId,
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * ### Custom Domains
 * **Example:** Attach a custom domain
 * ```typescript
 * const domain = yield* Cloudflare.Pages.Domain("site-domain", {
 *   projectName: project.name,
 *   name: "www.example.com",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/pages/
 *
 * @resource
 * @product Pages
 * @category Workers & Compute
 */
export declare const Project: import("../../Resource.ts").ResourceClass<Project>;
/**
 * Returns true if the given value is a Project resource.
 */
export declare const isProject: (value: unknown) => value is Project;
export declare const ProjectProvider: () => import("effect/Layer").Layer<Provider.Provider<Project>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | pages.CloudflareOpContext>;
export {};
//# sourceMappingURL=Project.d.ts.map