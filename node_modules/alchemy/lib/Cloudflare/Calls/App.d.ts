import * as calls from "@distilled.cloud/cloudflare/calls";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Calls.App";
type TypeId = typeof TypeId;
export type AppProps = {
    /**
     * A short description of the app, not shown to end users and not unique.
     * Mutable in place. If omitted, a unique name is generated from the app,
     * stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
};
export type AppAttributes = {
    /**
     * Cloudflare-generated unique identifier for the app. Used in client SDK
     * session URLs (`https://rtc.live.cloudflare.com/v1/apps/{appId}/...`).
     */
    appId: string;
    /**
     * The Cloudflare account the app belongs to.
     */
    accountId: string;
    /**
     * App secret (bearer token) used to authenticate against the Realtime SFU
     * HTTPS API. Returned only at creation time and never re-readable — Alchemy
     * persists it in state and carries it forward across updates.
     */
    secret: Redacted.Redacted<string>;
    /**
     * A short description of the app.
     */
    name: string;
    /**
     * When the app was created.
     */
    created: string;
    /**
     * When the app was last modified.
     */
    modified: string;
};
export type App = Resource<TypeId, AppProps, AppAttributes, never, Providers>;
/**
 * A Cloudflare Realtime (formerly "Calls") SFU application.
 *
 * An app is the unit of isolation for Cloudflare's WebRTC SFU: clients
 * connect to sessions scoped to the app's auto-assigned `appId`, and your
 * backend authenticates management calls with the create-only `secret`
 * (a bearer token). The only configurable property is the human-readable
 * `name`, which is mutable in place.
 * ### Creating an App
 * **Example:** App with a generated name
 * ```typescript
 * const app = yield* Cloudflare.Calls.App("realtime", {});
 * ```
 *
 * **Example:** App with an explicit name
 * ```typescript
 * const app = yield* Cloudflare.Calls.App("realtime", {
 *   name: "my-realtime-app",
 * });
 * ```
 *
 * ### Using the credentials
 * **Example:** Passing the appId and secret to a backend
 * ```typescript
 * // appId is public — it appears in client session URLs:
 * const appId = app.appId;
 *
 * // The secret is redacted — use it server-side as a bearer token
 * // against https://rtc.live.cloudflare.com/v1/apps/{appId}/...
 * const secret = app.secret; // Redacted<string>
 * ```
 *
 * @see https://developers.cloudflare.com/realtime/
 *
 * @resource
 * @product Calls
 * @category Media
 */
export declare const App: import("../../Resource.ts").ResourceClass<App>;
/**
 * Returns true if the given value is a App resource.
 */
export declare const isApp: (value: unknown) => value is App;
export declare const AppProvider: () => import("effect/Layer").Layer<Provider.Provider<App>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | calls.CloudflareOpContext>;
export {};
//# sourceMappingURL=App.d.ts.map