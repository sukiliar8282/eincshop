import type { InputProps } from "../../Input.ts";
import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the TanStack Start build. */
export declare const TANSTACK_START_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/tanstack-start";
/** The AWS Lambda deploy target for the TanStack Start build. */
export declare const TANSTACK_START_AWS_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/tanstack-start/aws";
export interface TanStackStartProps extends FrameworkSiteProps {
}
/**
 * Deploy a [TanStack Start](https://tanstack.com/start) application to AWS:
 * the SSR server on a streaming Lambda Function URL, client assets in S3,
 * and a CloudFront distribution whose edge router serves uploaded files from
 * S3 and forwards everything else to the server.
 *
 * The build runs through
 * `@alchemy.run/frontend-frameworks/tanstack-start` with the
 * `@alchemy.run/frontend-frameworks/tanstack-start/aws` deploy target — both
 * must be installed in your project, alongside `@tanstack/react-start` (or
 * `@tanstack/solid-start`) and `vite`.
 *
 * Your `vite.config.ts` needs no adapter wiring: TanStack Start is pure
 * Vite, so the integration drives the project's own `vite build`, forces the
 * SSR bundle to be self-contained, and wraps its fetch handler as a
 * streaming Lambda handler.
 *
 * ### Creating TanStack Start Sites
 * **Example:** Basic TanStack Start App
 * ```typescript
 * const site = yield* AWS.Website.TanStackStart("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* AWS.Website.TanStackStart("Web", {
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
 * const site = yield* AWS.Website.TanStackStart("Web", {
 *   rootDir: "./app",
 *   memorySize: 2048,
 *   env: {
 *     API_BASE: api.url,
 *   },
 * });
 * ```
 *
 * **Example:** Read An Environment Variable From A Server Function
 * ```typescript
 * // src/routes/index.tsx
 * const getApiBase = createServerFn({ method: "GET" }).handler(() => ({
 *   apiBase: process.env.API_BASE,
 * }));
 * ```
 *
 * ### Shared Router
 * **Example:** Serve Through An Existing Router
 * ```typescript
 * const router = yield* AWS.Website.Router("FrontDoor", {});
 *
 * const site = yield* AWS.Website.TanStackStart("Web", {
 *   rootDir: "./app",
 *   domain: { router },
 * });
 * ```
 *
 * @resource
 */
export declare const TanStackStart: (id: string, props?: InputProps<TanStackStartProps>) => import("effect/Effect").Effect<{
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
//# sourceMappingURL=TanStackStart.d.ts.map