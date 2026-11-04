import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import { Stack } from "../../Stack.ts";
import { Stage } from "../../Stage.ts";
import { Certificate } from "../ACM/Certificate.ts";
import { Distribution } from "../CloudFront/Distribution.ts";
import { Invalidation } from "../CloudFront/Invalidation.ts";
import { Record as Route53Record } from "../Route53/Record.ts";
import { Records as Route53Records } from "../Route53/Records.ts";
import { type RouterProps } from "./shared.ts";
/**
 * Shared CloudFront front door with KV-based dynamic routing.
 *
 * `Router` owns a single CloudFront distribution with a placeholder origin.
 * Routes are registered lazily via KV entries. A CloudFront Function reads the
 * KV store at the edge and dynamically sets the origin using
 * `cf.updateRequestOrigin()`.
 *
 * Sites register themselves by writing their file manifest and metadata into
 * the Router's KV store. The Router's CF function matches incoming requests to
 * routes by host pattern and path prefix, then delegates to `routeSite()` for
 * static site routing or directly sets URL/S3 origins.
 * ### Creating Routers
 * **Example:** Basic Router
 * ```typescript
 * const router = yield* Router("WebsiteRouter", {
 *   domain: { name: "example.com", hostedZoneId },
 * });
 * ```
 *
 * ### Inline Routes
 * **Example:** URL And Bucket Routes
 * ```typescript
 * const router = yield* Router("WebsiteRouter", {
 *   routes: {
 *     "/api/*": { url: api.functionUrl },
 *     "/*": { bucket: assetsBucket },
 *   },
 * });
 * ```
 *
 * ### Attaching Sites
 * **Example:** Serve A StaticSite Through The Router
 * ```typescript
 * const router = yield* Router("WebsiteRouter", {
 *   invalidation: { paths: "all", wait: true },
 * });
 *
 * // The site registers itself in the Router's KV store; no new
 * // distribution is created.
 * const docs = yield* AWS.Website.StaticSite("DocsSite", {
 *   path: "./docs/dist",
 *   domain: {
 *     router,
 *     path: "/docs",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Router: (id: string, _props: RouterProps) => Effect.Effect<{
    certificate: Certificate | {
        certificateArn: Input<string>;
    } | undefined;
    distribution: Distribution;
    records: Route53Record[];
    invalidation: Invalidation | undefined;
    kvStoreArn: Input<string>;
    kvNamespace: string;
    distributionId: Input<string>;
    distributionArn: Input<string>;
    /**
     * Same-stack bind targets for attached-site hostnames (see
     * `WebsiteRouterBindTargets` in shared.ts): a site declaring
     * `domain: { name, router }` binds its concrete hostnames onto the
     * distribution (alias), the managed certificate (SAN), and the
     * Route 53 record set. Only populated when the Router owns a
     * `domain` — without one there is no viewer certificate to cover
     * bound aliases.
     */
    bindTargets: {
        distribution: Distribution;
        certificate: Certificate | undefined;
        records: Route53Records | undefined;
    } | undefined;
    /**
     * The most significant URL the Router serves at — always `urls[0]`.
     */
    url: Input<string>;
    /**
     * Every URL the Router serves at, most significant first —
     * `[https://<domain.name>?, ...aliases, <CloudFront default
     * domain>?]` (the default domain only while `cloudfrontUrl` is
     * enabled). Redirect hostnames never appear — they serve no content.
     */
    urls: Input<string>[];
}, never, import("../Providers.ts").Providers | Stack | Stage>;
//# sourceMappingURL=Router.d.ts.map