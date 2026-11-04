import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import { Stack } from "../../Stack.ts";
import { Stage } from "../../Stage.ts";
import type { WebsiteDomainProps, WebsiteRouterDomainProps } from "./shared.ts";
/**
 * Narrow a normalized `domain` prop to its Router-attached shape.
 * @internal
 */
export declare const asRouterDomain: (domain: WebsiteDomainProps | undefined) => WebsiteRouterDomainProps | undefined;
/**
 * Register a **dev-mode** site with its `AWS.Website.Router`.
 *
 * `alchemy dev` replaces a site's S3 bucket + asset upload with the
 * framework's own dev server, but the Router-facing subgraph stays exactly
 * the same resource types as a live deploy — `KvRoutesUpdate` route entries
 * (byte-identical to live) plus a `KvEntries` metadata blob. Only the
 * metadata *contents* differ: instead of an `s3` origin plus a file
 * manifest, dev writes a `servers` origin pointing at the local dev
 * server, which `routeSite()` in cfcode.ts already handles (every KV file
 * lookup misses, so it falls through to `setUrlOrigin`).
 *
 * There is deliberately no dev-only resource type and no `ctx.dev` branch
 * inside `Router`: switching between `alchemy dev` and `alchemy deploy`
 * must be a `providerMode` change on the same graph, not a different graph.
 *
 * Must be called from inside the site's own namespace (the composites call
 * it after `Namespace.push(id)`) so the KV namespace hash and the child
 * resource FQNs match the live path exactly.
 *
 * @returns the site's URLs, computed the same way the live Router
 * attachment computes them.
 * @internal
 */
export declare const registerDevRouterRoute: (domain: WebsiteRouterDomainProps, devUrl: Input<string | undefined>) => Effect.Effect<string, never, import("../Providers.ts").Providers | Stack | Stage>;
//# sourceMappingURL=DevRouterRoute.d.ts.map