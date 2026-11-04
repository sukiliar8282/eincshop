import * as stream from "@distilled.cloud/cloudflare/stream";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Redacted from "effect/Redacted";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Stream.Webhook";
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
export const Webhook = Resource(TypeId);
/**
 * Returns true if the given value is a Webhook resource.
 */
export const isWebhook = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const WebhookProvider = () => Provider.succeed(Webhook, {
    stables: ["accountId"],
    diff: Effect.fn(function* ({ output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // The webhook is a singleton per account — moving accounts is a
        // replacement.
        if (output !== undefined && output.accountId !== accountId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const observed = yield* getWebhook(acct);
        if (observed === undefined)
            return undefined;
        const attrs = toAttributes(observed, acct);
        // The webhook is an account singleton with no ownership markers.
        // On a cold read (no prior output) an existing webhook was
        // configured outside Alchemy — brand it `Unowned` so the engine
        // refuses to take over unless `--adopt` is set.
        if (output === undefined)
            return Unowned(attrs);
        return attrs;
    }),
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Account-level singleton: the account has at most one Stream
        // webhook, so enumerate by reading that single slot — return a
        // one-element array when configured, [] when unset. Exactly
        // mirrors `read`.
        const observed = yield* getWebhook(accountId);
        if (observed === undefined)
            return [];
        return [toAttributes(observed, accountId)];
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        // Observe — read the live webhook config (`WebhookNotFound` means
        // the account has no webhook yet).
        const observed = yield* getWebhook(acct);
        // Sync — PUT is a true upsert, so create and update are the same
        // call. Skip the API entirely when the observed URL already
        // matches the desired one.
        if (observed !== undefined &&
            observed.notificationUrl === news.notificationUrl) {
            return toAttributes(observed, acct);
        }
        const updated = yield* stream.putWebhook({
            accountId: acct,
            notificationUrl: news.notificationUrl,
        });
        return toAttributes(updated, acct);
    }),
    delete: Effect.fn(function* ({ output }) {
        // DELETE on an already-absent webhook returns success, so the
        // operation is naturally idempotent; tolerate `WebhookNotFound`
        // anyway.
        yield* stream
            .deleteWebhook({ accountId: output.accountId })
            .pipe(Effect.catchTag("WebhookNotFound", () => Effect.void));
    }),
});
/**
 * Read the account's webhook, mapping "not configured"
 * (`WebhookNotFound`, Cloudflare error code 10003) to `undefined`.
 */
const getWebhook = (accountId) => stream
    .getWebhook({ accountId })
    .pipe(Effect.catchTag("WebhookNotFound", () => Effect.succeed(undefined)));
const toAttributes = (webhook, accountId) => ({
    accountId,
    notificationUrl: webhook.notificationUrl ?? "",
    modified: webhook.modified ?? undefined,
    secret: Redacted.make(webhook.secret ?? ""),
});
//# sourceMappingURL=Webhook.js.map