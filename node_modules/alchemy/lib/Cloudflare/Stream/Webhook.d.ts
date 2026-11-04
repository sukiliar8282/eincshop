import * as stream from "@distilled.cloud/cloudflare/stream";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Stream.Webhook";
type TypeId = typeof TypeId;
export type WebhookProps = {
    /**
     * The URL where Stream webhook notifications (e.g. video ready,
     * live input connected/disconnected) are sent. Mutable — updated in
     * place via Cloudflare's PUT upsert.
     */
    notificationUrl: string;
};
export type WebhookAttributes = {
    /**
     * The Cloudflare account the webhook belongs to.
     */
    accountId: string;
    /**
     * The URL where webhook notifications are sent.
     */
    notificationUrl: string;
    /**
     * The date and time the webhook was last modified.
     */
    modified: string | undefined;
    /**
     * The HMAC secret used to verify webhook request signatures
     * (`Webhook-Signature` header).
     */
    secret: Redacted.Redacted<string>;
};
export type Webhook = Resource<TypeId, WebhookProps, WebhookAttributes, never, Providers>;
/**
 * The Cloudflare Stream webhook — an **account-level singleton** that
 * receives notifications when videos finish processing or live inputs
 * connect/disconnect.
 *
 * Each account has at most one Stream webhook, so creating this
 * resource takes over the account's webhook slot; an existing webhook
 * configured outside Alchemy is only adopted when `--adopt` is set.
 * Destroying the resource deletes the webhook configuration.
 *
 * Requires the Stream subscription to be enabled on the account.
 * ### Configuring the webhook
 * **Example:** Receive Stream notifications
 * ```typescript
 * const webhook = yield* Cloudflare.Stream.Webhook("Notifications", {
 *   notificationUrl: "https://example.com/hooks/stream",
 * });
 *
 * // Verify the Webhook-Signature header with the HMAC secret:
 * const secret = webhook.secret; // Redacted<string>
 * ```
 *
 * @see https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/
 *
 * @resource
 * @product Stream
 * @category Media
 */
export declare const Webhook: import("../../Resource.ts").ResourceClass<Webhook>;
/**
 * Returns true if the given value is a Webhook resource.
 */
export declare const isWebhook: (value: unknown) => value is Webhook;
export declare const WebhookProvider: () => import("effect/Layer").Layer<Provider.Provider<Webhook>, never, CloudflareEnvironment | stream.CloudflareOpContext>;
export {};
//# sourceMappingURL=Webhook.d.ts.map