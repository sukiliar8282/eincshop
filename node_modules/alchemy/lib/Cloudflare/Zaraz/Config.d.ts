import * as zaraz from "@distilled.cloud/cloudflare/zaraz";
import * as Effect from "effect/Effect";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import { type Reference } from "../Zone/index.ts";
import { defineZarazEvents } from "./ZarazEventTypes.ts";
export type Workflow = zaraz.GetWorkflowResponse;
export type Settings = zaraz.PutConfigRequest["settings"];
export type Analytics = NonNullable<zaraz.PutConfigRequest["analytics"]>;
export type Consent = NonNullable<zaraz.PutConfigRequest["consent"]>;
export type ConfigProps = {
    /**
     * Zone whose Zaraz config should be managed. Accepts a zone id, a zone name
     * (`example.com`), or a `{ zoneId, name? }` object.
     */
    zone: Reference;
    /**
     * Data layer compatibility mode.
     */
    dataLayer?: boolean;
    /**
     * Key used for Zaraz debug mode. Defaults to the current zone config value.
     */
    debugKey?: string;
    /**
     * Zaraz settings to merge into the current zone config.
     */
    settings?: Partial<Settings>;
    /**
     * Zaraz tools keyed by tool id. When omitted, existing tools are retained.
     */
    tools?: Record<string, unknown>;
    /**
     * Zaraz triggers keyed by trigger id. When omitted, existing triggers are
     * retained.
     */
    triggers?: Record<string, unknown>;
    /**
     * Zaraz variables keyed by variable id. When omitted, existing variables are
     * retained. Secret variable values are not returned by Cloudflare reads.
     */
    variables?: Record<string, unknown>;
    /**
     * Cloudflare Monitoring settings.
     */
    analytics?: Analytics;
    /**
     * Zaraz consent management configuration.
     */
    consent?: Consent;
    /**
     * Single Page Application support.
     */
    historyChange?: boolean;
    /**
     * Zaraz workflow mode. When omitted, the current workflow is retained.
     */
    workflow?: Workflow;
    /**
     * Whether destroy should restore Cloudflare's default Zaraz config.
     *
     * By default, destroy only removes this resource from Alchemy state and keeps
     * the current zone-level Zaraz config intact.
     * If `workflow` is set, `delete: true` restores the workflow to real-time
     * mode, Cloudflare's default.
     * @default false
     */
    delete?: boolean;
};
export type Config = Resource<"Cloudflare.Zaraz.Config", ConfigProps, ConfigAttributes, never, Providers>;
export type ConfigAttributes = {
    /**
     * Cloudflare zone id.
     */
    zoneId: string;
    /**
     * Data layer compatibility mode.
     */
    dataLayer: boolean;
    /**
     * Key used for Zaraz debug mode.
     */
    debugKey: string;
    /**
     * General Zaraz settings.
     */
    settings: zaraz.GetConfigResponse["settings"];
    /**
     * Zaraz tools keyed by tool id.
     */
    tools: Record<string, unknown>;
    /**
     * Zaraz triggers keyed by trigger id.
     */
    triggers: Record<string, unknown>;
    /**
     * Zaraz variables keyed by variable id.
     */
    variables: Record<string, unknown>;
    /**
     * Zaraz internal version of the config.
     */
    zarazVersion: number;
    /**
     * Cloudflare Monitoring settings.
     */
    analytics?: zaraz.GetConfigResponse["analytics"];
    /**
     * Consent management configuration.
     */
    consent?: zaraz.GetConfigResponse["consent"];
    /**
     * Single Page Application support.
     */
    historyChange?: boolean | null;
    /**
     * Current Zaraz workflow mode.
     */
    workflow: Workflow;
};
/**
 * A Cloudflare Zaraz zone configuration.
 *
 * Cloudflare Zaraz is an edge-managed third-party tool manager and analytics
 * event pipeline. See the
 * {@link https://developers.cloudflare.com/zaraz/ | Cloudflare Zaraz docs} and
 * {@link https://developers.cloudflare.com/zaraz/web-api/ | Web API docs}.
 *
 * Zaraz is a zone-level singleton. This resource reconciles the current zone
 * config and workflow to the desired values while retaining existing settings
 * for fields omitted from props.
 *
 * Destroy keeps the current Zaraz config by default to avoid wiping unrelated
 * zone-level analytics setup. Set `delete: true` to restore Cloudflare's
 * default Zaraz config on destroy.
 * ### Managing Zaraz
 * **Example:** Enable data layer compatibility
 * ```typescript
 * const zaraz = yield* Cloudflare.Zaraz.Config("Analytics", {
 *   zone: "example.com",
 *   dataLayer: true,
 * });
 * ```
 *
 * **Example:** Update Zaraz settings
 * ```typescript
 * const zaraz = yield* Cloudflare.Zaraz.Config("Analytics", {
 *   zone: "example.com",
 *   settings: {
 *     autoInjectScript: true,
 *     hideIPAddress: true,
 *   },
 * });
 * ```
 *
 * **Example:** Enable preview workflow
 * ```typescript
 * const zaraz = yield* Cloudflare.Zaraz.Config("Analytics", {
 *   zone: "example.com",
 *   workflow: "preview",
 * });
 * ```
 *
 * @resource
 * @product Zaraz
 * @category Performance & Reliability
 */
export declare const Config: import("../../Resource.ts").ResourceConstructor<Config, Providers> & Effect.Effect<import("../../Resource.ts").ResourceConstructor<Config, never>, never, never> & {
    Self: import("../../Self.ts").Self<Config>;
    Provider: Provider.Provider<Config>;
    Aliases: readonly string[] | undefined;
    ref(id: string, options?: {
        stage?: string;
        stack?: string;
    }): Effect.Effect<Config, never, never>;
} & {
    /**
     * Define a type-only contract for the events sent through this Zaraz config.
     *
     * The returned value carries only types. Browser code should use
     * Cloudflare's injected `window.zaraz` API at runtime.
     */
    events: typeof defineZarazEvents;
};
export declare const ConfigProvider: () => import("effect/Layer").Layer<Provider.Provider<Config>, never, CloudflareEnvironment | zaraz.CloudflareOpContext>;
//# sourceMappingURL=Config.d.ts.map