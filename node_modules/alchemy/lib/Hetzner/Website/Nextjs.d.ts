import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/**
 * The framework-integration module that drives `next build` plus a Node
 * `next({ dev: false })` serve entry. This module IS the Node pipeline
 * (not OpenNext).
 */
export declare const NEXTJS_NODE_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/nextjs/node";
export interface NextjsProps extends FrameworkSiteProps {
}
/**
 * Deploy a Next.js application to a Hetzner Cloud Server: `next build`
 * then a long-running `next({ dev: false })` systemd unit on port 3000.
 * Does **not** use OpenNext (those wrappers are Lambda/workerd).
 *
 * The `.next` output (and `public/` when present) is packed into the
 * unit archive. `next`, `react`, and `react-dom` are installed on the
 * unit with `npm install` rather than bundled.
 *
 * During `alchemy dev` the site is `next dev` and no cloud resources
 * are declared; `Alchemy.remote()` opts back into the live Service.
 *
 *
 * ### Creating Next.js Sites
 * **Example:** Basic Next.js App
 * ```typescript
 * const site = yield* Hetzner.Website.Nextjs("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Hetzner.Website.Nextjs("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 *   zone,
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Nextjs: (id: string, props?: NextjsProps) => import("effect/Effect").Effect<{
    url: import("../../Output.ts").Output<string | undefined, never>;
    server: undefined;
    service: undefined;
} | {
    url: string | import("../../Output.ts").Output<string | undefined, never>;
    server: import("../Server.ts").Server;
    service: import("../Service.ts").Service;
}, never, import("../../AlchemyContext.ts").AlchemyContext | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Provider.ts").Provider<import("../../Website/Server.ts").Server> | import("../Providers.ts").Providers>;
//# sourceMappingURL=Nextjs.d.ts.map