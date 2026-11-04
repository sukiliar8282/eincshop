import * as Namespace from "../../Namespace.js";
import { makeFrameworkSite } from "./FrameworkSite.js";
/** The framework-integration package that drives the Nuxt build. */
export const NUXT_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/nuxt";
/** The AWS Lambda deploy target for the Nuxt build. */
export const NUXT_AWS_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/nuxt/aws";
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
export const Nuxt = (id, props = {}) => {
    const p = props;
    return makeFrameworkSite(id, props, {
        name: "Nuxt",
        framework: NUXT_FRAMEWORK_SPECIFIER,
        target: NUXT_AWS_TARGET_SPECIFIER,
        options: p.nuxt !== undefined ? { nuxt: p.nuxt } : undefined,
    }).pipe(Namespace.push(id));
};
//# sourceMappingURL=Nuxt.js.map