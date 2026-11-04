import * as Namespace from "../../Namespace.js";
import { makeFrameworkSite } from "./FrameworkSite.js";
/** The framework-integration package that drives the Waku build. */
export const WAKU_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/waku";
/** The AWS Lambda deploy target for the Waku build. */
export const WAKU_AWS_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/waku/aws";
/**
 * Deploy a [Waku](https://waku.gg) application to AWS: the RSC server on a
 * streaming Lambda Function URL, static assets (SSG pages included) in S3,
 * and a CloudFront distribution whose edge router serves uploaded files
 * from S3 and forwards everything else to the server.
 *
 * The build runs through `@alchemy.run/frontend-frameworks/waku` with the
 * `@alchemy.run/frontend-frameworks/waku/aws` deploy target (this package's fork
 * of waku's aws-lambda adapter, streaming enabled) — both must be installed
 * in your project.
 *
 * ### Creating Waku Sites
 * **Example:** Basic Waku App
 * ```typescript
 * const site = yield* AWS.Website.Waku("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* AWS.Website.Waku("Web", {
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
 * const site = yield* AWS.Website.Waku("Web", {
 *   rootDir: "./app",
 *   memorySize: 2048,
 *   env: {
 *     API_BASE: api.url,
 *   },
 * });
 * ```
 *
 * ### Waku Config Overrides
 * Waku configuration lives in your `waku.config.*`. The `waku` prop
 * overrides it per key at deploy time — for values that vary by stage
 * or come from other resources.
 *
 * **Example:** Stage-dependent base path
 * ```typescript
 * const site = yield* AWS.Website.Waku("Web", {
 *   waku: {
 *     basePath: "/docs/",
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Waku = (id, props = {}) => {
    const p = props;
    return makeFrameworkSite(id, props, {
        name: "Waku",
        framework: WAKU_FRAMEWORK_SPECIFIER,
        target: WAKU_AWS_TARGET_SPECIFIER,
        // Deploy-time waku config overrides, merged over the project's
        // `waku.config.*` by the integration (per-key; overrides win).
        options: p.waku !== undefined ? { waku: p.waku } : undefined,
    }).pipe(Namespace.push(id));
};
//# sourceMappingURL=Waku.js.map