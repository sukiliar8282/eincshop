import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/**
 * The Next.js Node framework module (it is its own deploy target — not
 * OpenNext). Container-optimal path is `next build` + a long-running Node
 * process.
 */
export declare const NEXTJS_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/nextjs/node";
/** The Node container deploy target for the Next.js build. */
export declare const NEXTJS_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/nextjs/node";
export interface NextjsProps extends FrameworkSiteProps {
}
/**
 * Deploy a Next.js application to Railway as a long-running Node process:
 * `next build`, then a serve entry that `import("next")` +
 * `next({ dev: false }).prepare()` + `getRequestHandler()` on `PORT`
 * (default 3000). **Not** OpenNext — those wrappers are Lambda/workerd.
 *
 * The image `npm install`s `next`, `react`, and `react-dom`, and bakes
 * `.next` plus `public/` into `/app`.
 *
 * During `alchemy dev` the site is Next's own dev server (`next dev`) and
 * no cloud resources are declared; `Alchemy.remote()` opts back into the
 * full live deployment.
 *
 * ### Creating Next.js Sites
 * **Example:** Basic Next.js App
 * ```typescript
 * const site = yield* Railway.Website.Nextjs("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * ### Server Configuration
 * **Example:** Process Environment
 * ```typescript
 * const site = yield* Railway.Website.Nextjs("Web", {
 *   rootDir: "./app",
 *   env: {
 *     API_BASE: "https://api.example.com",
 *   },
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Nextjs: (id: string, props?: NextjsProps) => import("effect/Effect").Effect<{
    url: import("../../Output.ts").Output<string | undefined, never>;
    service: undefined;
    project: undefined;
} | {
    url: string;
    service: import("../Service.ts").Service;
    project: import("../Project.ts").Project;
} | {
    url: import("../../Output.ts").Output<string | undefined, never>;
    service: import("../Service.ts").Service;
    project: import("../Project.ts").Project;
}, never, import("../../AlchemyContext.ts").AlchemyContext | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Provider.ts").Provider<import("../../Website/Server.ts").Server> | import("../Providers.ts").Providers>;
//# sourceMappingURL=Nextjs.d.ts.map