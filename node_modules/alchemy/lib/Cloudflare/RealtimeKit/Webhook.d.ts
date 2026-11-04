import * as realtimeKit from "@distilled.cloud/cloudflare/realtime-kit";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.RealtimeKit.Webhook";
type TypeId = typeof TypeId;
/**
 * Event that can trigger a RealtimeKit webhook.
 */
export type WebhookEvent = "meeting.started" | "meeting.ended" | "meeting.participantJoined" | "meeting.participantLeft" | "meeting.chatSynced" | "recording.statusUpdate" | "livestreaming.statusUpdate" | "meeting.transcript" | "meeting.summary";
export type WebhookProps = {
    /**
     * The RealtimeKit app the webhook belongs to. Changing the app triggers a
     * replacement.
     */
    appId: string;
    /**
     * Human readable webhook name. If omitted, a unique name is generated from
     * the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * URL this webhook will send events to. Often a deployed Worker URL.
     */
    url: string;
    /**
     * Events that trigger this webhook.
     */
    events: WebhookEvent[];
    /**
     * Whether the webhook is active.
     * @default true
     */
    enabled?: boolean;
};
export type WebhookAttributes = {
    /**
     * Server-generated webhook identifier. Stable across updates.
     */
    webhookId: string;
    /**
     * The Cloudflare account the webhook belongs to.
     */
    accountId: string;
    /**
     * The RealtimeKit app the webhook belongs to.
     */
    appId: string;
    /**
     * Human readable webhook name.
     */
    name: string;
    /**
     * URL the webhook sends events to.
     */
    url: string;
    /**
     * Events that trigger this webhook.
     */
    events: WebhookEvent[];
    /**
     * Whether the webhook is active.
     */
    enabled: boolean;
    /**
     * When the webhook was created.
     */
    createdAt: string;
    /**
     * When the webhook was last modified.
     */
    updatedAt: string;
};
export type Webhook = Resource<TypeId, WebhookProps, WebhookAttributes, never, Providers>;
/**
 * A Cloudflare RealtimeKit webhook — receives meeting, recording,
 * livestream, transcript, and summary events for a RealtimeKit app.
 *
 * Name, URL, events, and enablement are all mutable in place; only moving
 * the webhook to a different app forces a replacement.
 * ### Creating a Webhook
 * **Example:** Meeting lifecycle events
 * ```typescript
 * const app = yield* Cloudflare.RealtimeKit.App("Meetings", {});
 *
 * const webhook = yield* Cloudflare.RealtimeKit.Webhook("Lifecycle", {
 *   appId: app.appId,
 *   url: "https://example.com/webhook",
 *   events: ["meeting.started", "meeting.ended"],
 * });
 * ```
 *
 * **Example:** Recording events to a Worker
 * ```typescript
 * const webhook = yield* Cloudflare.RealtimeKit.Webhook("Recordings", {
 *   appId: app.appId,
 *   url: worker.url,
 *   events: ["recording.statusUpdate"],
 * });
 * ```
 *
 * ### Updating a Webhook
 * **Example:** Pause delivery without deleting
 * ```typescript
 * const webhook = yield* Cloudflare.RealtimeKit.Webhook("Lifecycle", {
 *   appId: app.appId,
 *   url: "https://example.com/webhook",
 *   events: ["meeting.started", "meeting.ended"],
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/realtime/realtimekit/
 *
 * @resource
 * @product Realtime Kit
 * @category Media
 */
export declare const Webhook: import("../../Resource.ts").ResourceClass<Webhook>;
/**
 * Returns true if the given value is a Webhook resource.
 */
export declare const isWebhook: (value: unknown) => value is Webhook;
export declare const WebhookProvider: () => import("effect/Layer").Layer<Provider.Provider<Webhook>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | realtimeKit.CloudflareOpContext>;
export {};
//# sourceMappingURL=Webhook.d.ts.map