import * as stream from "@distilled.cloud/cloudflare/stream";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Stream.LiveInput";
/**
 * A Cloudflare Stream live input — an ingest endpoint (RTMPS/SRT/WebRTC)
 * that accepts live video and optionally records it as a Stream video.
 *
 * Live inputs are identified by an auto-assigned `uid`; every prop is
 * mutable in place via Cloudflare's PUT endpoint, so the resource is
 * never replaced. Deleting a live input does not delete videos already
 * recorded from it.
 *
 * Requires the Stream subscription to be enabled on the account.
 * ### Creating a live input
 * **Example:** Basic live input
 * ```typescript
 * const input = yield* Cloudflare.Stream.LiveInput("Broadcast", {});
 * ```
 *
 * **Example:** Live input with automatic recording
 * ```typescript
 * const input = yield* Cloudflare.Stream.LiveInput("Broadcast", {
 *   meta: { name: "town-hall" },
 *   recording: {
 *     mode: "automatic",
 *     timeoutSeconds: 10,
 *   },
 *   deleteRecordingAfterDays: 30,
 * });
 * ```
 *
 * ### Managing a live input
 * **Example:** Disable ingest without deleting the input
 * ```typescript
 * const input = yield* Cloudflare.Stream.LiveInput("Broadcast", {
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/stream/stream-live/
 *
 * @resource
 * @product Stream
 * @category Media
 */
export const LiveInput = Resource(TypeId);
/**
 * Returns true if the given value is a LiveInput resource.
 */
export const isLiveInput = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const LiveInputProvider = () => Provider.succeed(LiveInput, {
    stables: ["liveInputId", "accountId", "created"],
    diff: Effect.fn(function* ({ output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (output !== undefined && output.accountId !== accountId) {
            return { action: "replace" };
        }
        // Everything else is mutable via PUT.
        return undefined;
    }),
    read: Effect.fn(function* ({ output }) {
        // Live inputs have no deterministic name or tags, so a cold read
        // (state lost before the uid was persisted) cannot recover the
        // resource — rely on the cached uid.
        if (output?.liveInputId === undefined)
            return undefined;
        const accountId = output.accountId;
        const observed = yield* getLiveInput(accountId, output.liveInputId);
        return observed ? toAttributes(observed, accountId) : undefined;
    }),
    // Account collection: enumerate every live input in the account. The
    // Cloudflare list endpoint returns all inputs in a single response
    // (no cursor), so there is no extra pagination to drive. Hydrate each
    // item into the same Attributes shape `read` produces.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Cloudflare returns this list either wrapped (`{ liveInputs: [...] }`)
        // or as a bare `result` array depending on the account — handle both.
        const response = yield* stream.listLiveInputs({ accountId });
        const inputs = Array.isArray(response)
            ? response
            : (response.liveInputs ?? []);
        return inputs
            .filter((li) => li.uid !== null && li.uid !== undefined)
            .map((li) => toAttributes(li, accountId));
    }),
    reconcile: Effect.fn(function* ({ id, news, olds, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const meta = news.meta ?? {
            name: yield* createPhysicalName({ id, lowercase: true }),
        };
        // Observe — the uid cached on `output` is a hint, not a guarantee:
        // a not-found falls through to "missing" and we recreate.
        const observed = output?.liveInputId
            ? yield* getLiveInput(output.accountId ?? accountId, output.liveInputId)
            : undefined;
        if (!observed) {
            // Ensure — greenfield (or out-of-band delete): create with the
            // full desired body. uids are auto-assigned so there is no
            // AlreadyExists race to tolerate.
            const created = yield* stream.createLiveInput({
                accountId,
                defaultCreator: news.defaultCreator,
                deleteRecordingAfterDays: news.deleteRecordingAfterDays,
                enabled: news.enabled,
                meta,
                recording: news.recording,
            });
            return toAttributes(created, accountId);
        }
        // Sync — diff observed cloud state against desired. The update API
        // is a PUT, so send the full desired body, but skip the call
        // entirely on a no-op. `defaultCreator` and `recording` are not
        // echoed by the API, so `olds` is the best available baseline for
        // them.
        const observedAccount = output?.accountId ?? accountId;
        const dirty = (news.enabled ?? true) !== (observed.enabled ?? true) ||
            (news.deleteRecordingAfterDays ?? undefined) !==
                (observed.deleteRecordingAfterDays ?? undefined) ||
            !deepValueEquals(meta, observed.meta ?? {}) ||
            news.defaultCreator !== olds?.defaultCreator ||
            !deepValueEquals(news.recording ?? {}, olds?.recording ?? {});
        if (!dirty) {
            return toAttributes(observed, observedAccount);
        }
        const updated = yield* stream.updateLiveInput({
            accountId: observedAccount,
            liveInputIdentifier: observed.uid ?? output.liveInputId,
            defaultCreator: news.defaultCreator,
            deleteRecordingAfterDays: news.deleteRecordingAfterDays,
            enabled: news.enabled,
            meta,
            recording: news.recording,
        });
        return toAttributes(updated, observedAccount);
    }),
    delete: Effect.fn(function* ({ output }) {
        // Idempotent — a live input already deleted out-of-band surfaces
        // as `LiveInputNotFound` (Cloudflare error code 10003).
        yield* stream
            .deleteLiveInput({
            accountId: output.accountId,
            liveInputIdentifier: output.liveInputId,
        })
            .pipe(Effect.catchTag("LiveInputNotFound", () => Effect.void));
    }),
});
/**
 * Read a live input by uid, mapping "gone" (`LiveInputNotFound`,
 * Cloudflare error code 10003) to `undefined`.
 */
const getLiveInput = (accountId, liveInputId) => stream
    .getLiveInput({ accountId, liveInputIdentifier: liveInputId })
    .pipe(Effect.catchTag("LiveInputNotFound", () => Effect.succeed(undefined)));
const toAttributes = (input, accountId) => ({
    liveInputId: input.uid ?? "",
    accountId,
    created: input.created ?? undefined,
    modified: input.modified ?? undefined,
    enabled: input.enabled ?? true,
    deleteRecordingAfterDays: input.deleteRecordingAfterDays ?? undefined,
    meta: (input.meta ?? {}),
});
/**
 * Structural equality for plain-JSON values (`meta`, `recording`) —
 * primitives, arrays, and plain objects, `null`-tolerant and key-order
 * insensitive.
 */
const deepValueEquals = (a, b) => {
    if (a === b)
        return true;
    if (a === null || b === null || a === undefined || b === undefined) {
        return false;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((v, i) => deepValueEquals(v, b[i]));
    }
    if (typeof a === "object" && typeof b === "object") {
        const ka = Object.keys(a);
        const kb = Object.keys(b);
        return (ka.length === kb.length &&
            ka.every((k) => deepValueEquals(a[k], b[k])));
    }
    return false;
};
//# sourceMappingURL=LiveInput.js.map