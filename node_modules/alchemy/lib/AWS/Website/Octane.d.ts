import type { InputProps } from "../../Input.ts";
import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the Octane build. */
export declare const OCTANE_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/octane";
/** The AWS Lambda deploy target for the Octane build. */
export declare const OCTANE_AWS_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/octane/aws";
export interface OctaneProps extends FrameworkSiteProps {
    /**
     * Project root directory (the directory containing `vite.config.ts` and
     * `octane.config.ts`).
     * @default "."
     */
    rootDir?: string;
}
/**
 * Deploy an [OctaneJS](https://octanejs.dev) application to AWS: Octane's
 * SSR server on a streaming Lambda Function URL, static assets in S3, and a
 * CloudFront distribution whose edge router serves uploaded files from S3
 * and forwards everything else to the server.
 *
 * The build runs through `@alchemy.run/frontend-frameworks/octane` with the
 * `@alchemy.run/frontend-frameworks/octane/aws` deploy target — the project's
 * own `vite build` (with `@octanejs/vite-plugin`) produces the
 * self-contained node server bundle, and the target's finishing pass wraps
 * its fetch handler as a streaming Lambda handler. The project's
 * `octane.config.ts` must select the AWS marker adapter:
 *
 * ```ts
 * import { aws } from "@alchemy.run/frontend-frameworks/octane/aws-adapter";
 * import { defineConfig } from "@octanejs/vite-plugin";
 *
 * export default defineConfig({
 *   adapter: aws(),
 *   // ...
 * });
 * ```
 *
 * ### Creating Octane Sites
 * **Example:** Basic Octane App
 * ```typescript
 * const site = yield* AWS.Website.Octane("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* AWS.Website.Octane("Web", {
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
 * const site = yield* AWS.Website.Octane("Web", {
 *   rootDir: "./app",
 *   memorySize: 2048,
 *   env: {
 *     API_BASE: api.url,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Octane: (id: string, props?: InputProps<OctaneProps>) => import("effect/Effect").Effect<{
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
//# sourceMappingURL=Octane.d.ts.map