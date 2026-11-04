import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/**
 * The Next.js-on-Node framework module (`next build` + a custom
 * `next({ dev: false })` server). Not OpenNext.
 */
export declare const NEXTJS_NODE_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/nextjs/node";
export interface NextjsProps extends FrameworkSiteProps {
}
/**
 * Deploy a Next.js application to Fly as a long-running Node process:
 * `next build`, then a serve entry that `import("next")` +
 * `next({ dev: false }).prepare()` + `getRequestHandler()`. The `.next`
 * output (and `public/` when present) is baked into the image; `next` is
 * installed unbundled.
 *
 * Do not use OpenNext AWS/CF wrappers — those are Lambda/workerd.
 *
 * During `alchemy dev` the site is `next dev` and no cloud resources are
 * declared; `Alchemy.remote()` opts back into the live Service path.
 *
 *
 * ### Creating Next.js Sites
 * **Example:** Basic Next.js App
 * ```typescript
 * const site = yield* Fly.Website.Nextjs("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Fly.Website.Nextjs("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Nextjs: (id: string, props?: NextjsProps) => import("effect/Effect").Effect<{
    url: import("../../Output.ts").Output<string | undefined, never>;
    app: undefined;
    service: undefined;
    ip: undefined;
    certificate: undefined;
} | {
    url: string | import("../../Output.ts").Output<string, never>;
    app: import("../App.ts").App;
    service: import("../Service.ts").Service;
    ip: import("../IpAssignment.ts").IpAssignment;
    certificate: import("../Certificate.ts").Certificate | undefined;
}, never, import("../../AlchemyContext.ts").AlchemyContext | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Provider.ts").Provider<import("../../Website/Server.ts").Server> | import("../Providers.ts").Providers>;
//# sourceMappingURL=Nextjs.d.ts.map