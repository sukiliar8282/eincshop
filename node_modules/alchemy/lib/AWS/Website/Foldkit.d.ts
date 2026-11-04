import type { InputProps } from "../../Input.ts";
import { type ViteProps } from "./Vite.ts";
/**
 * Props for {@link Foldkit}. A Foldkit app is a plain Vite project, so the
 * surface is {@link ViteProps} — `rootDir`, `vite`, `domain`, `spa`,
 * `errorPage`, and the rest of the shared website props.
 */
export interface FoldkitProps extends ViteProps {
}
/**
 * Deploy a [Foldkit](https://foldkit.dev) app to AWS: the client build in
 * S3 behind a CloudFront distribution. Foldkit is an Elm-architecture
 * frontend framework built on Effect, and its apps are client-only Vite
 * projects — so the deployment is assets-only and never creates a server
 * function.
 *
 * The Foldkit Vite plugin lives in your project's own `vite.config.*`,
 * which loads natively. The build runs through
 * `@alchemy.run/frontend-frameworks/vite` with the
 * `@alchemy.run/frontend-frameworks/vite/aws` deploy target — the package
 * must be installed in your project. Input files are content-hashed so
 * unchanged projects skip the build and deploy entirely.
 *
 * Foldkit apps route on the client, so `spa` defaults on: unmatched paths
 * serve `index.html` with a `200` and the Foldkit runtime resolves the
 * route once the app boots.
 *
 * During `alchemy dev` the site is Vite's own dev server — Foldkit's HMR
 * and devtools wiring work unchanged — and no AWS resources are created.
 * `Alchemy.remote()` opts back into the full deployment.
 *
 * ### Creating Foldkit Sites
 * **Example:** Basic Foldkit App
 * ```typescript
 * const site = yield* AWS.Website.Foldkit("Web");
 * ```
 *
 * **Example:** Project in a Subdirectory
 * ```typescript
 * const site = yield* AWS.Website.Foldkit("Web", {
 *   rootDir: "applications/web",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* AWS.Website.Foldkit("Web", {
 *   domain: {
 *     name: "app.example.com",
 *     hostedZoneId: zone.hostedZoneId,
 *   },
 * });
 * ```
 *
 * ### Deep Links
 * A deep link like `/counter/42` arrives at the edge as a request for a
 * file that does not exist. `spa` is on by default so the shell is served
 * instead of a 404. An app that ships a real 404 page opts out with
 * `errorPage` — the two are mutually exclusive.
 *
 * **Example:** Serving a Real 404 Page
 * ```typescript
 * const site = yield* AWS.Website.Foldkit("Web", {
 *   spa: false,
 *   errorPage: "404.html",
 * });
 * ```
 *
 * ### Sharing a Router
 * **Example:** Serve Through an Existing AWS.Website.Router
 * ```typescript
 * const router = yield* AWS.Website.Router("Router", {});
 * const site = yield* AWS.Website.Foldkit("Web", {
 *   domain: { router },
 * });
 * ```
 *
 * ### Build Configuration
 * Vite configuration (the Foldkit plugin included) lives in your
 * project's own `vite.config.*`. The `vite` bag holds deploy-time
 * overrides merged over that file, and `config` selects an alternate
 * config file.
 *
 * **Example:** Deploy-Time Base Path Override
 * ```typescript
 * const site = yield* AWS.Website.Foldkit("Web", {
 *   vite: { base: "/app/" },
 * });
 * ```
 *
 * ### Local Development
 * **Example:** Foldkit's Vite Dev Server Under `alchemy dev`
 * ```typescript
 * // `alchemy dev` starts `vite` programmatically: site.url is the local
 * // dev server (Foldkit HMR included); no bucket or distribution is
 * // created.
 * const site = yield* AWS.Website.Foldkit("Web");
 * ```
 *
 * @resource
 */
export declare const Foldkit: (id: string, props?: InputProps<FoldkitProps>) => import("effect/Effect").Effect<{
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
//# sourceMappingURL=Foldkit.d.ts.map