import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import { AlchemyContext } from "../../AlchemyContext.ts";
import type { MemoOptions } from "../../Command/Memo.ts";
import * as Output from "../../Output.ts";
import { staticConfigFromAssets, type WebsiteAssetsProps, type WebsiteNotFoundHandling } from "../../Website/assets.ts";
import { Server as FrameworkServer, type ServerDevProps } from "../../Website/Server.ts";
import type { Providers } from "../Providers.ts";
import { Server } from "../Server.ts";
import { Service } from "../Service.ts";
import type { Zone } from "../Zone.ts";
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* Server(...)` and `Server(...)` both type-check).
 */
export type Ref<T> = T | Effect.Effect<T, never, Providers>;
/** Default listen port. Hetzner `deployUnit` curls `/health` whenever `PORT` is set. */
export declare const DEFAULT_WEBSITE_PORT = 3000;
export type { ServerDevProps, WebsiteAssetsProps, WebsiteNotFoundHandling };
export { staticConfigFromAssets };
/**
 * Props shared by every Hetzner framework website composite.
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
     * Options for the local dev server that runs this site under
     * `alchemy dev`.
     */
    dev?: ServerDevProps;
    /**
     * Process environment for the hosted unit (and the local framework
     * dev server). Not Cloudflare Worker bindings. Accepts `Output`s
     * (e.g. `VITE_API_URL: api.url`).
     */
    env?: Record<string, string | Redacted.Redacted<string> | Output.Output<string | undefined>>;
    /**
     * Static-asset routing (`notFoundHandling`, `htmlHandling`).
     */
    assets?: WebsiteAssetsProps;
    /**
     * Optional custom domain. Creates an A {@link RecordSet} on
     * {@link zone} pointing at the Server's public IPv4. The site `url`
     * becomes `http://{domain}:{port}` (no TLS on Service).
     */
    domain?: string;
    /**
     * Existing Hetzner DNS Zone `domain` is created in. Required when
     * {@link domain} is set — v1 does not provision a Zone.
     */
    zone?: Ref<Zone>;
    /**
     * Server the site's Service runs on. Accepts a `Hetzner.Server` or an
     * Effect that produces one. When omitted, a `cpx12` / `ubuntu-24.04`
     * Server is created in `fsn1` (public IPv4 is the Server default).
     */
    server?: Ref<Server>;
    /**
     * User-defined labels applied to auto-created Server / RecordSet.
     */
    tags?: Record<string, string>;
}
/** Per-framework wiring for {@link makeFrameworkSite}. */
export interface FrameworkSiteConfig {
    /** Display name used in error messages (e.g. `"SvelteKit"`). */
    name: string;
    /** Framework-integration module specifier. */
    framework: string;
    /** Node container deploy-target module specifier. */
    target: string;
    /**
     * Framework-specific build options forwarded to the integration (e.g.
     * `{ kit }`, `{ nuxt }`, `{ astro }`). Must be JSON-serializable.
     */
    options?: Record<string, unknown> | undefined;
    /**
     * Assets-only mode: no server modules (or every page prerendered). The
     * composite generates a static-file server as `main`.
     */
    static?: {
        spa?: boolean | undefined;
        errorPage?: string | undefined;
        htmlHandling?: "none" | "drop-trailing-slash" | undefined;
    } | undefined;
    /**
     * Vocs/Waku: serve `about/index.html` at `/about`.
     * @default "none"
     */
    htmlHandling?: "none" | "drop-trailing-slash";
    /**
     * Skip baking `clientDirectory` at `dist/`. Next.js serves `.next`
     * from the unit root instead.
     */
    skipClientAssets?: boolean | undefined;
    /**
     * Native packages to `npm install` into the unit instead of bundling
     * (Next.js needs `next` / `react` / `react-dom`).
     */
    install?: string[] | undefined;
}
export interface Website {
    /**
     * Local framework URL under `alchemy dev`, or the live Service URL
     * (`http://{ipv4}:{port}` / `http://{domain}:{port}`).
     */
    readonly url: string | Output.Output<string | undefined> | undefined;
    /** Server the unit runs on. `undefined` during `alchemy dev`. */
    readonly server: Server | undefined;
    /** Hosted systemd unit. `undefined` during `alchemy dev`. */
    readonly service: Service | undefined;
}
declare const FrameworkSiteError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.Website.FrameworkSiteError";
} & Readonly<A>;
export declare class FrameworkSiteError extends FrameworkSiteError_base<{
    readonly framework: string;
    readonly message: string;
    readonly cause?: unknown;
}> {
}
export declare const unwrapEnv: (env: Record<string, string | Redacted.Redacted<string> | Output.Output<string | undefined>> | undefined) => Record<string, string | Output.Output<string | undefined>> | undefined;
export declare const resolveWebsiteServer: (props: {
    readonly server?: Ref<Server> | undefined;
    readonly tags?: Record<string, string> | undefined;
}) => Effect.Effect<Server, never, Providers>;
export declare const bindWebsiteDomain: (props: {
    readonly domain: string;
    readonly zone: Ref<Zone>;
    readonly server: Server;
    readonly tags?: Record<string, string> | undefined;
}) => Effect.Effect<void, never, Providers>;
export declare const websiteUrl: (args: {
    readonly domain?: string | undefined;
    readonly service: Service;
    readonly port: number;
}) => string | Output.Output<string | undefined, never>;
/**
 * Composite-level tagged errors (`FrameworkSiteError`, filesystem) are
 * defects — `Alchemy.Stack` only admits `ConfigError` on the user effect.
 */
export declare const makeFrameworkSite: (id: string, props: FrameworkSiteProps, config: FrameworkSiteConfig) => Effect.Effect<{
    url: Output.Output<string | undefined, never>;
    server: undefined;
    service: undefined;
} | {
    url: string | Output.Output<string | undefined, never>;
    server: Server;
    service: Service;
}, never, AlchemyContext | FileSystem.FileSystem | Path.Path | import("../../Provider.ts").Provider<FrameworkServer> | Providers>;
//# sourceMappingURL=FrameworkSite.d.ts.map