import * as realtimeKit from "@distilled.cloud/cloudflare/realtime-kit";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.RealtimeKit.App";
type TypeId = typeof TypeId;
export type AppProps = {
    /**
     * Human readable app name. App names are not unique on Cloudflare's side.
     * If omitted, a unique name is generated from the app, stage, and logical
     * ID.
     *
     * RealtimeKit currently ships no update API, so the name cannot be changed
     * after creation — and no delete API either, so a name change cannot be
     * modeled as a replacement (the old app could never be removed). Changing
     * this property fails the deploy.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
};
export type AppAttributes = {
    /**
     * Server-generated app identifier (also called the organization id).
     * Stable for the lifetime of the app.
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
};
export type App = Resource<TypeId, AppProps, AppAttributes, never, Providers>;
/**
 * A Cloudflare RealtimeKit app — the organizational container for RealtimeKit
 * meetings, presets, and webhooks.
 *
 * RealtimeKit (the acquired Dyte platform) is in beta and must be enabled on
 * the account. The API is create-only today: there is no update and no delete
 * endpoint. Destroying the resource therefore only forgets the app from state
 * (with a warning) — the app itself remains on the account until Cloudflare
 * ships a delete API. Because of this, an existing app with the same name is
 * adopted rather than duplicated.
 * ### Creating an App
 * **Example:** Basic app
 * ```typescript
 * const app = yield* Cloudflare.RealtimeKit.App("Meetings", {
 *   name: "my-meetings-app",
 * });
 * ```
 *
 * **Example:** Child resources
 * ```typescript
 * const app = yield* Cloudflare.RealtimeKit.App("Meetings", {});
 *
 * const webhook = yield* Cloudflare.RealtimeKit.Webhook("Events", {
 *   appId: app.appId,
 *   url: "https://example.com/webhook",
 *   events: ["meeting.started", "meeting.ended"],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/realtime/realtimekit/
 *
 * @resource
 * @product Realtime Kit
 * @category Media
 */
export declare const App: import("../../Resource.ts").ResourceClass<App>;
/**
 * Returns true if the given value is a App resource.
 */
export declare const isApp: (value: unknown) => value is App;
export declare const AppProvider: () => import("effect/Layer").Layer<Provider.Provider<App>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | realtimeKit.CloudflareOpContext>;
declare const AppRenameNotSupported_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AppRenameNotSupported";
} & Readonly<A>;
/**
 * Error raised when a deploy attempts to rename a RealtimeKit app. The API
 * has neither an update endpoint (to rename in place) nor a delete endpoint
 * (to model the change as a replacement).
 */
export declare class AppRenameNotSupported extends AppRenameNotSupported_base<{
    readonly appId: string;
    readonly currentName: string;
    readonly desiredName: string;
    readonly message: string;
}> {
}
export {};
//# sourceMappingURL=App.d.ts.map