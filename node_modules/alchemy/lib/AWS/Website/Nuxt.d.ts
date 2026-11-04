import type { InputProps } from "../../Input.ts";
import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the Nuxt build. */
export declare const NUXT_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/nuxt";
/** The AWS Lambda deploy target for the Nuxt build. */
export declare const NUXT_AWS_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/nuxt/aws";
export interface NuxtProps extends FrameworkSiteProps {
    /**
     * Nuxt config overrides merged over the project's own `nuxt.config.ts`
     * (the highest-priority c12 layer — a value here wins over the file).
     * Use it for deploy-time values the config file can't express, e.g.
     * per-stage `runtimeConfig`; `nuxt.config.ts` remains the primary home
     * for everything else.
     *
     * Must be JSON-serializable — no functions, plugins, or modules (the
     * value persists in state and participates in the rebuild hash).
     * `nitro.preset` is always owned by the deploy target and cannot be
     * overridden here.
     */
    nuxt?: Record<string, unknown>;
}
/**
 * Deploy a Nuxt application to AWS: the nitro server on a streaming Lambda
 * Function URL, static assets (prerendered pages included) in S3, and a
 * CloudFront distribution whose edge router serves uploaded files from S3
 * and forwards everything else to the server.
 *
 * The build runs through `@alchemy.run/frontend-frameworks/nuxt` with the
 * `@alchemy.run/frontend-frameworks/nuxt/aws` deploy target (nitro's `aws-lambda` preset,
 * streaming enabled) — both must be installed in your project.
 *
 * ### Creating Nuxt Sites
 * **Example:** Basic Nuxt App
 * ```typescript
 * const site = yield* AWS.Website.Nuxt("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* AWS.Website.Nuxt("Web", {
 *   rootDir: "./app",
 *   domain: {
 *     name: "app.example.com",
 *     hostedZoneId: zone.hostedZoneId,
 *   },
 * });
 * ```
 *
 * ### Server Configuration
 * **Example:** Tune The Server Function
 * ```typescript
 * const site = yield* AWS.Website.Nuxt("Web", {
 *   rootDir: "./app",
 *   memorySize: 2048,
 *   env: {
 *     NUXT_PUBLIC_API_BASE: api.url,
 *   },
 * });
 * ```
 *
 * ### Config Overrides
 * `nuxt.config.ts` is the primary home for Nuxt configuration — it loads
 * natively. The `nuxt` prop layers deploy-time overrides on top (the
 * highest-priority c12 layer) for values the file can't express, like
 * per-stage settings. The bag must be JSON-serializable — no functions,
 * plugins, or modules — and `nitro.preset` stays owned by the deploy
 * target.
 *
 * **Example:** Deploy-time config overrides
 * ```typescript
 * const site = yield* AWS.Website.Nuxt("Web", {
 *   rootDir: "./app",
 *   nuxt: {
 *     app: { baseURL: "/docs/" },
 *     runtimeConfig: {
 *       public: { apiBase: "https://api.example.com" },
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Nuxt: (id: string, props?: InputProps<NuxtProps>) => import("effect/Effect").Effect<{
    bucket: undefined;
    build: import("../../Website/Server.ts").Server;
    files: undefined;
    distribution: undefined;
    invalidation: undefined;
    kvNamespace: string | undefined;
    server: undefined;
    serverUrl: undefined;
    url: import("../../Output.ts").Output<string | undefined, never>;
    urls: import("../../Output.ts").Output<string | undefined, never>[];
} | {
    bucket: import("../S3/Bucket.ts").Bucket;
    files: import("./AssetDeployment.ts").AssetDeployment;
    distribution: import("../CloudFront/Distribution.ts").Distribution | undefined;
    invalidation: import("../CloudFront/Invalidation.ts").Invalidation | undefined;
    kvNamespace: string;
    url: import("../../Input.ts").Input<string>;
    urls: import("../../Input.ts").Input<string>[];
    build: import("../../Website/Server.ts").Server;
    server: undefined;
    serverUrl: undefined;
} | {
    bucket: import("../S3/Bucket.ts").Bucket;
    files: import("./AssetDeployment.ts").AssetDeployment;
    distribution: import("../CloudFront/Distribution.ts").Distribution | undefined;
    invalidation: import("../CloudFront/Invalidation.ts").Invalidation | undefined;
    kvNamespace: string;
    url: import("../../Input.ts").Input<string>;
    urls: import("../../Input.ts").Input<string>[];
    build: import("../../Website/Server.ts").Server;
    server: import("../Lambda/Function.ts").Function;
    serverUrl: import("../../Output.ts").Output<string | undefined, never>;
}, never, import("../../AlchemyContext.ts").AlchemyContext | import("../../Provider.ts").Provider<import("../../Command/Build.ts").Build> | import("../../Provider.ts").Provider<import("../../Website/Server.ts").Server> | import("../Providers.ts").Providers | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Nuxt.d.ts.map