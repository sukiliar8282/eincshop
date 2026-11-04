import * as images from "@distilled.cloud/cloudflare/images";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Redacted from "effect/Redacted";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Images.SigningKey";
/**
 * A Cloudflare Images signing key — an HMAC key used to generate signed
 * image delivery URLs (`?sig=` tokens) for images that require signed URLs.
 *
 * Cloudflare allows at most **two** keys per account, supporting a
 * create-second/migrate/delete-first rotation model, and refuses to delete
 * the last remaining key. Re-PUTting an existing key name **rotates** (i.e.
 * regenerates) its value, so this resource is existence-only: once the key
 * exists, redeploys never re-PUT and the key material stays stable.
 *
 * Requires the Cloudflare Images subscription; accounts without it receive
 * the typed `ImagesAccessNotEnabled` error.
 * ### Creating a Signing Key
 * **Example:** Key with a generated name
 * ```typescript
 * const key = yield* Cloudflare.Images.SigningKey("UrlSigner", {});
 * ```
 *
 * **Example:** Key with an explicit name
 * ```typescript
 * const key = yield* Cloudflare.Images.SigningKey("UrlSigner", {
 *   name: "my-app-signer",
 * });
 * ```
 *
 * ### Using the key
 * **Example:** Signing image delivery URLs server-side
 * ```typescript
 * // The key material is redacted — pass it to your URL signer:
 * const secret = key.value; // Redacted<string>
 * ```
 *
 * @see https://developers.cloudflare.com/images/manage-images/serve-images/serve-private-images/
 *
 * @resource
 * @product Images
 * @category Media
 */
export const SigningKey = Resource(TypeId);
/**
 * Returns true if the given value is an SigningKey resource.
 */
export const isSigningKey = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const SigningKeyProvider = () => Provider.succeed(SigningKey, {
    stables: ["keyName", "accountId", "value"],
    diff: Effect.fn(function* ({ olds, news, output }) {
        // News may still contain unresolved plan-time expressions — defer to
        // the engine's default update logic until everything is concrete.
        if (!isResolved(news))
            return undefined;
        // The key name is its PUT path identifier — it cannot be renamed.
        // Only compare when the old name is knowable; a generated name is
        // stable across deploys so an omitted name never replaces.
        const oldName = output?.keyName ?? olds?.name;
        if (oldName !== undefined &&
            news.name !== undefined &&
            news.name !== oldName) {
            return { action: "replace" };
        }
        if (typeof olds?.accountId === "string" &&
            typeof news.accountId === "string" &&
            olds.accountId !== news.accountId) {
            return { action: "replace" };
        }
        if (output?.accountId !== undefined &&
            typeof news.accountId === "string" &&
            news.accountId !== output.accountId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ??
            olds?.accountId ??
            accountId;
        const name = output?.keyName ?? (yield* createKeyName(id, olds?.name));
        const observed = yield* findKey(acct, name);
        if (!observed)
            return undefined;
        const attrs = toAttributes(observed, acct);
        // Signing keys carry no ownership markers. With no prior output we
        // cannot prove we created a same-named key — report it `Unowned` so
        // the engine gates takeover behind the adopt policy.
        return output?.keyName ? attrs : Unowned(attrs);
    }),
    // Account-scoped collection (Cloudflare caps it at two keys per
    // account). The non-paginated `listV1Keys` returns the whole set in one
    // call; map each entry to the same Attributes shape `read` produces.
    // Accounts without the Images signing-keys entitlement have no keys to
    // enumerate — treat as an empty set rather than a hard failure.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* images.listV1Keys({ accountId }).pipe(Effect.map((response) => (response.keys ?? []).map((key) => toAttributes(key, accountId))), Effect.catchTag("ImagesAccessNotEnabled", () => Effect.succeed([])));
    }),
    reconcile: Effect.fn(function* ({ id, news }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Inputs have been resolved to concrete strings by Plan.
        const acct = news.accountId ?? accountId;
        const name = yield* createKeyName(id, news.name);
        // 1. Observe — list the account's keys and look for ours. `output`
        //    is only a cache of the name; the list is authoritative.
        let observed = yield* findKey(acct, name);
        // 2. Ensure — existence-only resource: PUT only when the key is
        //    missing. Re-PUTting an existing name would ROTATE the key
        //    material out from under consumers, so a present key is final —
        //    there is no sync step.
        if (!observed) {
            const created = yield* images.putV1Key({
                accountId: acct,
                signingKeyName: name,
            });
            observed =
                created.keys?.find((key) => key.name === name) ??
                    (yield* findKey(acct, name));
        }
        if (!observed?.value) {
            // The PUT response and the follow-up list both failed to surface
            // the key — eventual-consistency blip; fail typed so the engine
            // can retry the reconcile.
            return yield* Effect.fail(new images.KeyNotFound({
                code: 5404,
                message: `signing key ${name} not observable after create`,
            }));
        }
        return toAttributes(observed, acct);
    }),
    delete: Effect.fn(function* ({ output }) {
        // Note: Cloudflare refuses to delete the last remaining signing key —
        // that error is surfaced as-is (non-retryable) rather than swallowed.
        yield* images
            .deleteV1Key({
            accountId: output.accountId,
            signingKeyName: output.keyName,
        })
            .pipe(Effect.catchTag("KeyNotFound", () => Effect.void));
    }),
});
/**
 * Find a signing key by exact name in the account's key list. Returns
 * `undefined` when absent.
 */
const findKey = (accountId, name) => images
    .listV1Keys({ accountId })
    .pipe(Effect.map((response) => (response.keys ?? []).find((key) => key.name === name)));
const createKeyName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const toAttributes = (key, accountId) => ({
    keyName: key.name ?? "",
    accountId,
    value: Redacted.make(key.value ?? ""),
});
//# sourceMappingURL=SigningKey.js.map