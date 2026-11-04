import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import { AlchemyContext } from "../../AlchemyContext.ts";
import type { MemoOptions } from "../../Command/Memo.ts";
import * as Output from "../../Output.ts";
import { staticConfigFromAssets, type WebsiteAssetsProps, type WebsiteNotFoundHandling } from "../../Website/assets.ts";
import { Server as FrameworkServer, type ServerDevProps } from "../../Website/Server.ts";
import { App } from "../App.ts";
import { Certificate } from "../Certificate.ts";
import { IpAssignment } from "../IpAssignment.ts";
import type { Providers } from "../Providers.ts";
import { Service } from "../Service.ts";
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* App(...)` and `App(...)` both type-check).
 */
export type Ref<T> = T | Effect.Effect<T, never, Providers>;
export type { ServerDevProps, WebsiteAssetsProps, WebsiteNotFoundHandling };
export { staticConfigFromAssets };
/**
 * Props shared by every Fly framework website composite.
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
     * Parent Fly App. Accepts a `Fly.App` or an Effect that produces one.
     * When omitted, a `Fly.App` is created under this site's namespace.
     */
    app?: Ref<App>;
    /**
     * Process environment for the hosted server. Not Cloudflare Worker
     * bindings — values become Machine env vars. Accepts `Output`s
     * (e.g. `VITE_API_URL: api.url`).
     */
    env?: Record<string, string | Redacted.Redacted<string> | Output.Output<string | undefined>>;
    /**
     * Static-asset routing (`notFoundHandling`, `htmlHandling`). Hashed
     * client files are uploaded to Tigris regardless of this bag.
     */
    assets?: WebsiteAssetsProps;
    /**
     * Options for the local dev server that runs this site under
     * `alchemy dev`.
     */
    dev?: ServerDevProps;
    /**
     * Optional custom hostname. Requests ACME (`Fly.Certificate`) on the
     * App. `url` becomes `https://<domain>` (existing DNS only for v1).
     */
    domain?: string;
    /**
     * User-defined tags. Accepted for API parity; Fly Services do not
     * surface resource tags.
     */
    tags?: Record<string, string>;
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
     * Assets-only routing forwarded to the Node target (Vite SPA fallback).
     * `spa` also publishes client files to Tigris at `/`.
     */
    static?: {
        spa?: boolean;
        errorPage?: string;
    } | undefined;
    /**
     * Vocs/Waku: serve `about/index.html` at `/about`.
     * @default "none"
     */
    htmlHandling?: "none" | "drop-trailing-slash";
    /**
     * Packages installed into the Machine image with `npm install` instead
     * of bundling (Next.js needs `next`).
     */
    install?: string[] | undefined;
    /**
     * Skip baking `clientDirectory` at `/app/dist`. Next.js serves `.next`
     * from the image root instead.
     */
    skipClientAssets?: boolean | undefined;
}
export interface FrameworkSite {
    /**
     * Public site URL. Local framework URL under `alchemy dev`;
     * `https://{app}.fly.dev` (or `https://{domain}`) on deploy.
     */
    url: string | Output.Output<string | undefined> | undefined;
    /** Parent Fly App. `undefined` during `alchemy dev`. */
    app: App | undefined;
    /** Hosted Fly Service. `undefined` during `alchemy dev`. */
    service: Service | undefined;
    /** Shared Anycast IPv4 so `{app}.fly.dev` answers. */
    ip: IpAssignment | undefined;
    /** ACME certificate when {@link FrameworkSiteProps.domain} is set. */
    certificate: Certificate | undefined;
}
declare const FrameworkSiteError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "FrameworkSiteError";
} & Readonly<A>;
export declare class FrameworkSiteError extends FrameworkSiteError_base<{
    readonly framework: string;
    readonly message: string;
    readonly cause?: unknown;
}> {
}
/**
 * Shared implementation behind the Fly framework website composites:
 * `Website.Server` runs the framework toolchain (dev sidecar / production
 * build), then a live deploy hosts `serve-node.mjs` on a Fly.Service.
 *
 * Callers pipe `Namespace.push(id)` themselves (the composites do).
 *
 * Composite-level tagged errors (`FrameworkSiteError`, filesystem) are
 * defects — `Alchemy.Stack` only admits `ConfigError` on the user
 * effect, same as Cloudflare/AWS Website composites.
 */
export declare const makeFrameworkSite: (id: string, props: FrameworkSiteProps, config: FrameworkSiteConfig) => Effect.Effect<{
    url: Output.Output<string | undefined, never>;
    app: undefined;
    service: undefined;
    ip: undefined;
    certificate: undefined;
} | {
    url: string | Output.Output<string, never>;
    app: App;
    service: Service;
    ip: IpAssignment;
    certificate: Certificate | undefined;
}, never, AlchemyContext | FileSystem.FileSystem | Path.Path | import("../../Provider.ts").Provider<FrameworkServer> | Providers>;
/** Push {@link id} then run {@link makeFrameworkSite}. */
export declare const frameworkSite: (id: string, props: FrameworkSiteProps, config: FrameworkSiteConfig) => Effect.Effect<{
    url: Output.Output<string | undefined, never>;
    app: undefined;
    service: undefined;
    ip: undefined;
    certificate: undefined;
} | {
    url: string | Output.Output<string, never>;
    app: App;
    service: Service;
    ip: IpAssignment;
    certificate: Certificate | undefined;
}, never, AlchemyContext | FileSystem.FileSystem | Path.Path | import("../../Provider.ts").Provider<FrameworkServer> | Providers>;
//# sourceMappingURL=FrameworkSite.d.ts.map