import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import { AlchemyContext } from "../../AlchemyContext.ts";
import type { MemoOptions } from "../../Command/Memo.ts";
import type { Input } from "../../Input.ts";
import * as Output from "../../Output.ts";
import { Table } from "../DynamoDB/Table.ts";
import { Function as LambdaFunction, type FunctionProps } from "../Lambda/Function.ts";
import { Bucket } from "../S3/Bucket.ts";
import { Queue } from "../SQS/Queue.ts";
import { AssetDeployment } from "./AssetDeployment.ts";
import { Server, type ServerDevProps } from "../../Website/Server.ts";
import { type WebsiteAssetsConfig, type WebsiteDomainProps, type WebsiteEdgeProps, type WebsiteInvalidationProps } from "./shared.ts";
/**
 * The framework-integration module that drives the `@opennextjs/aws` build
 * (it is its own deploy target — the module IS the AWS pipeline).
 */
export declare const NEXTJS_AWS_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/nextjs/aws";
/** The S3 key prefix the OpenNext ISR/fetch cache seed is uploaded under. */
export declare const NEXTJS_CACHE_PREFIX = "_cache";
export interface NextjsProps {
    /**
     * Project root directory (the directory containing `next.config.ts`).
     * @default "."
     */
    rootDir?: string;
    /**
     * Controls which files are hashed to decide whether the build re-runs.
     * @default true
     */
    memo?: MemoOptions | boolean;
    /**
     * Options for the local dev server that runs this site under
     * `alchemy dev`.
     */
    dev?: ServerDevProps;
    /**
     * SSR server (Lambda) configuration.
     */
    /**
     * Memory allocated to the server function, in MB.
     * @default 1024
     */
    memorySize?: number;
    /**
     * Maximum server request duration.
     * @default 30 seconds
     */
    timeout?: Duration.Duration;
    /**
     * Environment variables for the SSR server (Lambda environment).
     * Values accept `Output`s (e.g. `API_URL: api.url`).
     */
    env?: Record<string, any>;
    /**
     * Server instruction set architecture.
     * @default "x86_64"
     */
    architecture?: "x86_64" | "arm64";
    /**
     * Lambda runtime for the server function.
     * @default "nodejs24.x"
     */
    runtime?: FunctionProps["runtime"];
    /**
     * Image optimization (Lambda) configuration.
     */
    imageOptimization?: {
        /**
         * Memory allocated to the image optimization function, in MB.
         * @default 1536
         */
        memorySize?: number;
    };
    /**
     * Static asset upload configuration.
     */
    assets?: WebsiteAssetsConfig;
    /**
     * Optional custom domain. A string is shorthand for `{ name }`; `null`
     * explicitly clears a previously set domain. Set `domain.router` to
     * serve the site through an existing `AWS.Website.Router` instead of a
     * standalone CloudFront distribution.
     */
    domain?: string | WebsiteDomainProps | null;
    /**
     * Serve the site at its CloudFront default domain
     * (`https://dxxxx.cloudfront.net`). `false` 301s default-domain requests
     * to `https://<domain.name>` at the edge and excludes the default domain
     * from the `urls` output. Requires `domain`; not applicable when
     * `domain.router` is set.
     * @default true
     */
    cloudfrontUrl?: boolean;
    /**
     * Additional CloudFront Function customizations.
     */
    edge?: WebsiteEdgeProps;
    /**
     * Optional deterministic S3 bucket name for the asset bucket.
     */
    bucketName?: string;
    /**
     * Whether to delete uploaded objects when the bucket is destroyed.
     * @default false
     */
    forceDestroy?: boolean;
    /**
     * CloudFront invalidation behavior.
     * @default { paths: "all", wait: false }
     */
    invalidation?: false | WebsiteInvalidationProps;
    /**
     * User-defined tags applied to created resources.
     */
    tags?: Record<string, string>;
}
/**
 * Deploy a Next.js application to AWS with the OpenNext
 * (`@opennextjs/aws`) serverless topology: the SSR server on a streaming
 * Lambda Function URL, static assets in S3 behind CloudFront's KV-manifest
 * edge router, the ISR/fetch cache in a dedicated S3 bucket, a dedicated
 * image optimization Lambda routed at `/_next/image`, and ISR revalidation
 * through an SQS FIFO queue plus a DynamoDB tag-cache table.
 *
 * The build runs through `@alchemy.run/frontend-frameworks/nextjs/aws` (the
 * `@opennextjs/aws` pipeline) — both it and `@opennextjs/aws` must be
 * installed in your project. When the project has no `open-next.config.ts`,
 * a minimal default with the streaming server wrapper is generated.
 *
 * During `alchemy dev` the site is Next's own dev server (`next dev`) and
 * no cloud resources are declared; `Alchemy.remote()` opts back into the
 * full live deployment.
 *
 * ### Creating Next.js Sites
 * **Example:** Basic Next.js App
 * ```typescript
 * const site = yield* AWS.Website.Nextjs("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* AWS.Website.Nextjs("Web", {
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
 * const site = yield* AWS.Website.Nextjs("Web", {
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
export declare const Nextjs: (id: string, _props?: NextjsProps | undefined) => Effect.Effect<{
    bucket: undefined;
    build: Server;
    cacheBucket: undefined;
    cacheFiles: undefined;
    distribution: undefined;
    files: undefined;
    imageFunction: undefined;
    imageUrl: undefined;
    invalidation: undefined;
    kvNamespace: string | undefined;
    revalidationFunction: undefined;
    revalidationQueue: undefined;
    server: undefined;
    serverUrl: undefined;
    tagCacheTable: undefined;
    url: Output.Output<string | undefined, never>;
    urls: Output.Output<string | undefined, never>[];
} | {
    bucket: Bucket;
    files: AssetDeployment;
    distribution: import("../CloudFront/Distribution.ts").Distribution | undefined;
    invalidation: import("../CloudFront/Invalidation.ts").Invalidation | undefined;
    kvNamespace: string;
    url: Input<string>;
    urls: Input<string>[];
    build: Server;
    cacheBucket: Bucket;
    cacheFiles: AssetDeployment;
    imageFunction: LambdaFunction;
    imageUrl: Output.Output<string | undefined, never>;
    revalidationFunction: LambdaFunction;
    revalidationQueue: Queue;
    server: LambdaFunction;
    serverUrl: Output.Output<string | undefined, never>;
    tagCacheTable: Table;
}, never, AlchemyContext | import("../../Provider.ts").Provider<import("../../Command/Build.ts").Build> | import("../../Provider.ts").Provider<Server> | import("../Providers.ts").Providers | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Nextjs.d.ts.map