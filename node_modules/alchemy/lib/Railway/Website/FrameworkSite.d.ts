import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import { AlchemyContext } from "../../AlchemyContext.ts";
import type { PackageInstall } from "../../Bundle/InstalledPackages.ts";
import type { MemoOptions } from "../../Command/Memo.ts";
import * as Output from "../../Output.ts";
import { staticConfigFromAssets, type WebsiteAssetsProps, type WebsiteNotFoundHandling } from "../../Website/assets.ts";
import { Server as FrameworkServer, type ServerDevProps } from "../../Website/Server.ts";
import { Project, type Project as ProjectResource } from "../Project.ts";
import type { Environment as EnvironmentResource } from "../ProjectEnvironment.ts";
import type { Providers } from "../Providers.ts";
import { Service, type Service as ServiceResource } from "../Service.ts";
/** Port the generated Node serve entry and Railway Service listen on. */
export declare const WEBSITE_PORT = 3000;
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* Project(...)` and `Project(...)` both type-check).
 */
export type Ref<T> = T | Effect.Effect<T, never, Providers>;
export type { ServerDevProps, WebsiteAssetsProps, WebsiteNotFoundHandling };
export { staticConfigFromAssets };
/**
 * Props shared by every Railway framework website composite.
 */
export interface FrameworkSiteProps {
    /**
     * Parent Railway Project. Accepts a `Railway.Project` or an Effect
     * that produces one. When omitted, a `Railway.Project("Project")` is
     * created under this site's namespace.
     */
    project?: Ref<ProjectResource>;
    /**
     * Environment to deploy the Service into. Accepts a `Railway.Project`
     * (primary environment), a `Railway.Environment`, or `{ environmentId }`.
     * Defaults to the project's primary environment.
     */
    environment?: Ref<EnvironmentResource | ProjectResource | {
        readonly environmentId: string;
    }>;
    /**
     * Project root directory (the directory containing `package.json`).
     * @default "."
     */
    rootDir?: string;
    /**
     * Controls which files are hashed to decide whether the build re-runs.
     * Forwarded to the framework integration when it honors memo options.
     * @default true
     */
    memo?: MemoOptions | boolean;
    /**
     * Process environment for the deployed Service (and, under
     * `alchemy dev`, the framework dev server). Accepts `Output`s
     * (e.g. `VITE_API_URL: api.url`).
     */
    env?: Record<string, string | Redacted.Redacted<string> | Output.Output<string | undefined>>;
    /**
     * Static-asset routing (`notFoundHandling`, `htmlHandling`). Railway
     * CDN caches hashed files by Content-Type regardless of this bag.
     */
    assets?: WebsiteAssetsProps;
    /**
     * Options for the local dev server that runs this site under
     * `alchemy dev`.
     */
    dev?: ServerDevProps;
    /**
     * Optional custom hostname attached via `Railway.CustomDomain`. A
     * string is the hostname (`www.example.com`). When set, `url` is
     * `https://{domain}` instead of the generated `*.up.railway.app`.
     */
    domain?: string;
    /**
     * User-defined tags. Railway Services do not persist tags; accepted
     * for API parity with AWS/Cloudflare Website composites.
     */
    tags?: Record<string, string>;
}
/**
 * Static-asset serving options mapped from Cloudflare `AssetsConfig`
 * onto the generated Node serve entry.
 */
export interface WebsiteStaticConfig {
    /**
     * Answer misses with `index.html` (200) so client-side routes
     * deep-link. Mutually exclusive with {@link errorPage}.
     */
    spa?: boolean;
    /**
     * Serve this page (e.g. `404.html`) with status 404 when no file
     * matches. Mutually exclusive with {@link spa}.
     */
    errorPage?: string;
    /**
     * Vocs/Waku: serve `about/index.html` at `/about`.
     * @default "none"
     */
    htmlHandling?: "none" | "drop-trailing-slash";
}
/** Per-framework wiring for {@link makeFrameworkSite}. */
export interface FrameworkSiteConfig {
    /** Display name used in error messages (e.g. `"SvelteKit"`). */
    name: string;
    /** Framework-integration module specifier. */
    framework: string;
    /** Node deploy-target module specifier. */
    target: string;
    /**
     * Framework-specific build options forwarded to the integration (e.g.
     * `{ kit }`, `{ nuxt }`, `{ astro }`). Must be JSON-serializable.
     */
    options?: Record<string, unknown> | undefined;
    /**
     * Assets-only serving: used when the build produced no server modules
     * (Vite, Foldkit, Vocs, Astro `output: "static"`).
     */
    static?: WebsiteStaticConfig | undefined;
    /**
     * Native packages to `npm install` into the image instead of bundling
     * (Next.js needs `next` / `react`).
     */
    install?: PackageInstall | undefined;
    /**
     * How to bake the build into the image.
     * - `"client"` (default): `COPY dist /app/dist` from `clientDirectory`
     * - `"next"`: `COPY .next` + `public` (and `next.config.*`)
     * @default "client"
     */
    bake?: "client" | "next" | undefined;
}
export interface Website {
    /**
     * Public site URL. Under `alchemy dev` this is the framework (or
     * static) dev server (`http://localhost:<port>`). On deploy it is
     * `https://{domain}` (`*.up.railway.app`, or the custom hostname).
     */
    url: string | Output.Output<string | undefined> | undefined;
    /**
     * The Railway Service that serves the site. `undefined` under
     * `alchemy dev` (no cloud resources are declared).
     */
    service: ServiceResource | undefined;
    /**
     * The Railway Project the Service belongs to. `undefined` under
     * `alchemy dev`.
     */
    project: ProjectResource | undefined;
}
declare const FrameworkServerError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Railway.Website.FrameworkServerError";
} & Readonly<A>;
export declare class FrameworkServerError extends FrameworkServerError_base<{
    readonly framework: string;
    readonly message: string;
    readonly cause?: unknown;
}> {
}
/**
 * Composite-level tagged errors (`FrameworkServerError`, filesystem)
 * are defects — `Alchemy.Stack` only admits `ConfigError` on the user
 * effect.
 */
export declare const makeFrameworkSite: (id: string, props: FrameworkSiteProps, config: FrameworkSiteConfig) => Effect.Effect<{
    url: Output.Output<string | undefined, never>;
    service: undefined;
    project: undefined;
} | {
    url: string;
    service: Service;
    project: Project;
} | {
    url: Output.Output<string | undefined, never>;
    service: Service;
    project: Project;
}, never, AlchemyContext | FileSystem.FileSystem | Path.Path | import("../../Provider.ts").Provider<FrameworkServer> | Providers>;
//# sourceMappingURL=FrameworkSite.d.ts.map