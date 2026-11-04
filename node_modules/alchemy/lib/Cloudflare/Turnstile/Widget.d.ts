import * as turnstile from "@distilled.cloud/cloudflare/turnstile";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Turnstile.Widget";
type TypeId = typeof TypeId;
/**
 * Rendering / interaction mode of a Turnstile widget.
 */
export type WidgetMode = "managed" | "non-interactive" | "invisible";
/**
 * Region a Turnstile widget can be served from. Cannot be changed after
 * creation.
 */
export type WidgetRegion = "world" | "china";
/**
 * Clearance level granted when the widget is embedded on a Cloudflare zone.
 */
export type ClearanceLevel = "no_clearance" | "jschallenge" | "managed" | "interactive";
export type WidgetProps = {
    /**
     * Human readable widget name. Not unique. If omitted, a unique name is
     * generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Hostnames the widget is allowed to run on (e.g. `example.com`).
     * Subdomains are covered automatically.
     */
    domains: string[];
    /**
     * Widget mode: `managed` (Cloudflare decides if an interaction is
     * required), `non-interactive` (never requires interaction), or
     * `invisible` (no visible widget).
     */
    mode: WidgetMode;
    /**
     * Region where this widget can be used. Cannot be changed after creation —
     * updating this property triggers a replacement.
     * @default "world"
     */
    region?: WidgetRegion;
    /**
     * If `true`, Cloudflare issues computationally expensive challenges in
     * response to malicious bots (Enterprise only).
     * @default false
     */
    botFightMode?: boolean;
    /**
     * If Turnstile is embedded on a Cloudflare site and the widget should
     * grant challenge clearance, this setting determines the clearance level.
     * @default "no_clearance"
     */
    clearanceLevel?: ClearanceLevel;
    /**
     * Return the Ephemeral ID in `/siteverify` responses (Enterprise only).
     * @default false
     */
    ephemeralId?: boolean;
    /**
     * Do not show any Cloudflare branding on the widget (Enterprise only).
     * @default false
     */
    offlabel?: boolean;
};
export type WidgetAttributes = {
    /**
     * Widget item identifier tag. This is the public sitekey embedded in HTML.
     */
    sitekey: string;
    /**
     * Secret key for this widget, used server-side with the
     * `/turnstile/v0/siteverify` endpoint.
     */
    secret: Redacted.Redacted<string>;
    /**
     * The Cloudflare account the widget belongs to.
     */
    accountId: string;
    /**
     * Human readable widget name.
     */
    name: string;
    /**
     * Hostnames the widget is allowed to run on.
     */
    domains: string[];
    /**
     * Widget mode.
     */
    mode: WidgetMode;
    /**
     * Region where this widget can be used.
     */
    region: WidgetRegion;
    /**
     * Whether bot fight mode is enabled (Enterprise only).
     */
    botFightMode: boolean;
    /**
     * Clearance level granted on Cloudflare zones.
     */
    clearanceLevel: ClearanceLevel;
    /**
     * Whether the Ephemeral ID is returned in `/siteverify` (Enterprise only).
     */
    ephemeralId: boolean;
    /**
     * Whether Cloudflare branding is hidden (Enterprise only).
     */
    offlabel: boolean;
    /**
     * When the widget was created.
     */
    createdOn: string;
    /**
     * When the widget was last modified.
     */
    modifiedOn: string;
};
export type Widget = Resource<TypeId, WidgetProps, WidgetAttributes, never, Providers>;
/**
 * A Cloudflare Turnstile widget — Cloudflare's CAPTCHA alternative.
 *
 * A widget is identified by its auto-assigned `sitekey` (the public key you
 * embed in HTML) and produces a `secret` used server-side against the
 * `/turnstile/v0/siteverify` endpoint. Name, domains, mode, and clearance
 * settings are all mutable in place; only `region` forces a replacement.
 * ### Creating a Widget
 * **Example:** Managed widget
 * ```typescript
 * const widget = yield* Cloudflare.Turnstile.Widget("signup-form", {
 *   domains: ["example.com"],
 *   mode: "managed",
 * });
 * ```
 *
 * **Example:** Invisible widget with an explicit name
 * ```typescript
 * const widget = yield* Cloudflare.Turnstile.Widget("api-guard", {
 *   name: "api-guard",
 *   domains: ["example.com", "app.example.com"],
 *   mode: "invisible",
 * });
 * ```
 *
 * ### Using the keys
 * **Example:** Embedding the sitekey and verifying tokens
 * ```typescript
 * // The sitekey is public — render it in your HTML:
 * const sitekey = widget.sitekey;
 *
 * // The secret is redacted — pass it to your server-side verifier:
 * const secret = widget.secret; // Redacted<string>
 * ```
 *
 * @see https://developers.cloudflare.com/turnstile/
 *
 * @resource
 * @product Turnstile
 * @category Application Security
 */
export declare const Widget: import("../../Resource.ts").ResourceClass<Widget>;
/**
 * Returns true if the given value is a Widget resource.
 */
export declare const isWidget: (value: unknown) => value is Widget;
export declare const WidgetProvider: () => import("effect/Layer").Layer<Provider.Provider<Widget>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | turnstile.CloudflareOpContext>;
export {};
//# sourceMappingURL=Widget.d.ts.map