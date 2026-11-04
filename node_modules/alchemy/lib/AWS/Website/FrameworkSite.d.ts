import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import { AlchemyContext } from "../../AlchemyContext.ts";
import type { MemoOptions } from "../../Command/Memo.ts";
import type { Input, InputProps } from "../../Input.ts";
import * as Output from "../../Output.ts";
import { Function as LambdaFunction, type FunctionProps } from "../Lambda/Function.ts";
import { Server, type ServerDevProps } from "../../Website/Server.ts";
import { type WebsiteAssetsConfig, type WebsiteDomainProps, type WebsiteEdgeProps, type WebsiteInvalidationProps } from "./shared.ts";
/**
 * Props shared by every framework website composite (SvelteKit, Nuxt,
 * Waku, Octane, Astro). Each composite extends this with its
 * framework-specific configuration, kept FLAT — the composite is the
 * framework, so framework keys need no namespace.
 */
export interface FrameworkSiteProps {
    /**
     * Project root directory (the directory containing `package.json`).
     * @default "."
     */
    rootDir?: string;
    /**
     * Controls which files are hashed to decide whether the build re-runs.
     * @default true
     */
    memo?: MemoOptions | boolean;
    /**
     * Environment variables for the SSR server (Lambda environment).
     * Values accept `Output`s (e.g. `API_URL: api.url`).
     */
    env?: Record<string, any>;
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
     * Static asset upload configuration.
     */
    assets?: WebsiteAssetsConfig;
    /**
     * Options for the local dev server that runs this site under
     * `alchemy dev`.
     */
    dev?: ServerDevProps;
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
/** Per-framework wiring for {@link makeFrameworkSite}. */
export interface FrameworkSiteConfig {
    /** Display name used in error messages (e.g. `"SvelteKit"`). */
    name: string;
    /** Framework-integration module specifier. */
    framework: string;
    /** AWS deploy-target module specifier. */
    target: string;
    /**
     * Framework-specific build options forwarded to the integration (e.g.
     * `{ kit }`, `{ nuxt }`, `{ astro }`). Must be JSON-serializable.
     */
    options?: Record<string, unknown> | undefined;
    /**
     * Assets-only mode: every page was prerendered at build time, so no
     * server function is created and misses resolve to the error page (or
     * the index page for SPAs). Set by composites whose framework supports
     * a fully static output (Astro's `output: "static"`).
     */
    static?: {
        spa?: boolean;
        errorPage?: string;
    } | undefined;
}
/**
 * The shared implementation behind the framework website composites:
 * build the framework through its AWS deploy target, then deploy the
 * server output on a streaming Lambda Function URL with static assets in
 * S3 behind a CloudFront distribution (or attach to a shared Router).
 *
 * During `alchemy dev` the site is the framework's own dev server (native
 * HMR) and no cloud resources are declared; `Alchemy.remote()` opts back
 * into the full live deployment.
 *
 * Callers pipe `Namespace.push(id)` themselves (the composites do), so
 * resource FQNs are identical to the previous per-framework
 * implementations.
 */
export declare const makeFrameworkSite: (id: string, propsIn: InputProps<FrameworkSiteProps, never>, config: FrameworkSiteConfig) => Effect.Effect<{
    bucket: undefined;
    build: Server;
    files: undefined;
    distribution: undefined;
    invalidation: undefined;
    kvNamespace: string | undefined;
    server: undefined;
    serverUrl: undefined;
    url: Output.Output<string | undefined, never>;
    urls: Output.Output<string | undefined, never>[];
} | {
    bucket: import("../S3/Bucket.ts").Bucket;
    files: import("./AssetDeployment.ts").AssetDeployment;
    distribution: import("../CloudFront/Distribution.ts").Distribution | undefined;
    invalidation: import("../CloudFront/Invalidation.ts").Invalidation | undefined;
    kvNamespace: string;
    url: Input<string>;
    urls: Input<string>[];
    build: Server;
    server: undefined;
    serverUrl: undefined;
} | {
    bucket: import("../S3/Bucket.ts").Bucket;
    files: import("./AssetDeployment.ts").AssetDeployment;
    distribution: import("../CloudFront/Distribution.ts").Distribution | undefined;
    invalidation: import("../CloudFront/Invalidation.ts").Invalidation | undefined;
    kvNamespace: string;
    url: Input<string>;
    urls: Input<string>[];
    build: Server;
    server: LambdaFunction;
    serverUrl: Output.Output<string | undefined, never>;
}, never, AlchemyContext | import("../../Provider.ts").Provider<import("../../Command/Build.ts").Build> | import("../../Provider.ts").Provider<Server> | import("../Providers.ts").Providers | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=FrameworkSite.d.ts.map