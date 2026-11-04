import * as flagship from "@distilled.cloud/cloudflare/flagship";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Flagship.App";
type TypeId = typeof TypeId;
export type AppProps = {
    /**
     * Human readable app name. Apps group flags by project or service. If
     * omitted, a unique name is generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
};
export type AppAttributes = {
    /**
     * Server-generated app identifier. Stable across updates; used as the
     * `appId` for flags, the Worker binding, and all evaluation calls.
     */
    appId: string;
    /**
     * The Cloudflare account the app belongs to.
     */
    accountId: string;
    /**
     * Human readable app name.
     */
    name: string;
    /**
     * When the app was created.
     */
    createdAt: string;
    /**
     * When the app was last modified.
     */
    updatedAt: string;
    /**
     * Email of the actor who last modified the app, or `edge-gateway` for
     * gateway-authenticated changes.
     */
    updatedBy: string;
};
export type App = Resource<TypeId, AppProps, AppAttributes, never, Providers>;
/**
 * A Cloudflare Flagship app — a container for feature flags.
 *
 * Flagship is Cloudflare's feature flag service. Flags are organized into
 * apps that map to your projects or services; the app's `appId` is what a
 * Worker's `Flagship` binding points at and what every evaluation call is
 * scoped to. The name is mutable in place; the app id never changes.
 * ### Creating an App
 * **Example:** App with a generated name
 * ```typescript
 * const app = yield* Cloudflare.Flagship.App("Flags", {});
 * ```
 *
 * **Example:** App with an explicit name
 * ```typescript
 * const app = yield* Cloudflare.Flagship.App("Flags", {
 *   name: "my-service-flags",
 * });
 * ```
 *
 * ### Using the App
 * **Example:** Define flags in the app
 * ```typescript
 * const app = yield* Cloudflare.Flagship.App("Flags", {});
 *
 * const flag = yield* Cloudflare.Flagship.Flag("NewCheckout", {
 *   appId: app.appId,
 *   key: "new-checkout",
 *   defaultVariation: "off",
 *   variations: { off: false, on: true },
 * });
 * ```
 *
 * ### Binding to a Worker
 * **Example:** Effect-style Worker (recommended)
 * `Cloudflare.Flagship.ReadFlags(app)` attaches the binding to the surrounding
 * Worker and returns the runtime client for evaluating flags. Every `Flagship`
 * method is mirrored as an Effect, so no `Effect.tryPromise` wrapping is needed.
 * ```typescript
 * export const App = Cloudflare.Flagship.App("Flags", {});
 *
 * Cloudflare.Worker(
 *   "FlagsWorker",
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const flags = yield* Cloudflare.Flagship.ReadFlags(App);
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const enabled = yield* flags.getBooleanValue("new-checkout", false, {
 *           userId: "user-42",
 *         });
 *         return HttpServerResponse.text(enabled ? "on" : "off");
 *       }),
 *     };
 *   }).pipe(Effect.provide(Cloudflare.Flagship.ReadFlagsBinding)),
 * );
 * ```
 *
 * **Example:** Declare the binding on `env`
 * Declaring the app on a Worker's `env` maps it to the native `Flagship`
 * runtime binding via `InferEnv`.
 * ```typescript
 * export const App = Cloudflare.Flagship.App("Flags", {});
 *
 * export const Worker = Cloudflare.Worker("Worker", {
 *   main: "./src/worker.ts",
 *   env: { FLAGS: App },
 * });
 *
 * export type WorkerEnv = Cloudflare.InferEnv<typeof Worker>;
 * //   { FLAGS: Flagship }
 * ```
 *
 * **Example:** Async-style worker with the raw runtime binding
 * ```typescript
 * import type { WorkerEnv } from "../alchemy.run.ts";
 *
 * export default {
 *   async fetch(request: Request, env: WorkerEnv) {
 *     const enabled = await env.FLAGS.getBooleanValue("new-checkout", false, {
 *       userId: "user-42",
 *     });
 *     return new Response(enabled ? "on" : "off");
 *   },
 * };
 * ```
 *
 * @see https://developers.cloudflare.com/flagship/
 * @see https://developers.cloudflare.com/api/resources/flagship/
 *
 * @resource
 * @product Flagship
 * @category Developer Platform
 */
export declare const App: import("../../Resource.ts").ResourceClass<App>;
/**
 * Returns true if the given value is a Flagship App resource.
 */
export declare const isApp: (value: unknown) => value is App;
export declare const AppProvider: () => import("effect/Layer").Layer<Provider.Provider<App>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | flagship.CloudflareOpContext>;
export {};
//# sourceMappingURL=App.d.ts.map