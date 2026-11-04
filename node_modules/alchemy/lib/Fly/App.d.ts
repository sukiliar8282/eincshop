import * as machines from "@distilled.cloud/fly-io/machines";
import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export interface AppProps {
    /**
     * Fly App name. Globally unique, DNS-compatible (lowercase letters,
     * digits, hyphens), must start with a letter, max 30 characters. If
     * omitted, a unique name is generated from the stack, stage and logical
     * ID. Changing it replaces the App.
     */
    name?: string;
    /**
     * Organization slug. Defaults to the current token's org
     * (`getCurrentToken`). Changing it replaces the App.
     */
    orgSlug?: string;
    /**
     * Isolated network name. Immutable after create — changing it replaces
     * the App.
     */
    network?: string;
    /**
     * Enable `*.{name}.fly.dev` subdomains. Create-only; ignored on update
     * (Fly has no App update API).
     */
    enableSubdomains?: boolean;
}
export type App = Resource<"Fly.App", AppProps, {
    /** Fly App id. */
    appId: string;
    /** Physical Fly App name. */
    appName: string;
    /** Fly internal numeric id, if the API returned one. */
    internalNumericId: number | undefined;
    /** Isolated network name, if set. */
    network: string | undefined;
    /** Observed status (e.g. `deployed`, `pending`). */
    status: string | undefined;
    /** Organization slug. */
    orgSlug: string | undefined;
    /** Observed machine count. */
    machineCount: number | undefined;
    /** Observed volume count. */
    volumeCount: number | undefined;
    /** Public `https://{appName}.fly.dev` URL. */
    url: string;
}, never, Providers>;
/**
 * A Fly.App is a global namespace in your account. It contains Machines,
 * Services, Secrets, IPs, and certificates.
 *
 * @see https://fly.io/docs/machines/api/apps-resource/
 *
 * ### Create an App
 * Alchemy generates a unique name unless you pass one. `url` is
 * `https://{appName}.fly.dev`. Nothing answers there until a
 * {@link Service} or {@link Machine} publishes a proxy service and the App
 * has an {@link IpAssignment}.
 *
 * **Example:** Generated name
 * ```typescript
 * const site = yield* Fly.App("Site");
 * ```
 *
 * :::note
 * Prefer omitting `name` in tests and CI so names stay unique and
 * reclaimable.
 * :::
 *
 * ### A stable hostname
 * Pass `name` when you need a stable `fly.dev` hostname.
 *
 * **Example:** Explicit name
 * ```typescript
 * const site = yield* Fly.App("Site", {
 *   name: "my-site",
 * });
 * ```
 *
 * :::caution[Changing `name` replaces the App]
 * Fly cannot have two Apps with the same name. Alchemy deletes the
 * old App first, then creates the new one.
 * :::
 *
 * ### Organization
 * Org defaults to the current token. Pass `orgSlug` to pin it.
 *
 * **Example:** Pin an org
 * ```typescript
 * const site = yield* Fly.App("Site", {
 *   name: "my-site",
 *   orgSlug: "my-org",
 * });
 * ```
 *
 * :::caution[Changing `orgSlug` replaces the App]
 * The App is created in the new org. The old App is deleted.
 * :::
 *
 * ### Subdomains
 * `enableSubdomains: true` turns on `*.{appName}.fly.dev`.
 *
 * **Example:** Enable subdomains
 * ```typescript
 * const site = yield* Fly.App("Site", {
 *   name: "my-site",
 *   enableSubdomains: true,
 * });
 * ```
 *
 * :::note[Create-only]
 * Flipping `enableSubdomains` later is ignored.
 * :::
 *
 * ### Isolated network
 * `network` is an optional 6PN name.
 *
 * **Example:** Custom network
 * ```typescript
 * const site = yield* Fly.App("Site", {
 *   name: "my-site",
 *   network: "private",
 * });
 * ```
 *
 * :::caution[Changing `network` replaces the App]
 * The App is recreated on the new network.
 * :::
 *
 * ### Module-scope declarations
 * Declare the App once. Pass it into every child. Resource-valued props
 * accept the resource or an Effect producing it. Do not unwrap it just
 * to pass it along.
 *
 * **Example:** Module-scope App
 * ```typescript
 * // src/app.ts
 * import * as Fly from "alchemy/Fly";
 *
 * export const Site = Fly.App("Site");
 * ```
 *
 * @resource
 */
export declare const App: import("../Resource.ts").ResourceClass<App>;
declare const AppNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.AppNotCreated";
} & Readonly<A>;
export declare class AppNotCreated extends AppNotCreated_base<{
    name: string;
}> {
}
/**
 * Apps in the current token's org that Alchemy owns. Used by {@link App}
 * `list()` and by child resources (Machine / Volume / Secret) so nuke
 * never enumerates the whole org unfiltered.
 */
export declare const listOwnedApps: () => Effect.Effect<{
    /** Fly App id. */
    appId: string;
    /** Physical Fly App name. */
    appName: string;
    /** Fly internal numeric id, if the API returned one. */
    internalNumericId: number | undefined;
    /** Isolated network name, if set. */
    network: string | undefined;
    /** Observed status (e.g. `deployed`, `pending`). */
    status: string | undefined;
    /** Organization slug. */
    orgSlug: string | undefined;
    /** Observed machine count. */
    machineCount: number | undefined;
    /** Observed volume count. */
    volumeCount: number | undefined;
    /** Public `https://{appName}.fly.dev` URL. */
    url: string;
}[], import("@distilled.cloud/fly-io").BadGateway | import("@distilled.cloud/fly-io").ConfigError | import("@distilled.cloud/fly-io").CreateExtensionTosAgreementNotAuthorized | import("@distilled.cloud/fly-io").FlyIoParseError | import("./Environment.ts").FlyOrgNotFound | import("@distilled.cloud/fly-io").Forbidden | import("@distilled.cloud/fly-io").GatewayTimeout | import("effect/unstable/http/HttpClientError").HttpClientError | import("@distilled.cloud/fly-io").InternalServerError | import("@distilled.cloud/fly-io").ServiceUnavailable | import("@distilled.cloud/fly-io").TooManyRequests | import("@distilled.cloud/fly-io").Unauthorized | import("@distilled.cloud/fly-io").UnknownFlyIoError, machines.FlyIoOpContext>;
export declare const AppProvider: () => import("effect/Layer").Layer<Provider.Provider<App>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | machines.FlyIoOpContext>;
export {};
//# sourceMappingURL=App.d.ts.map