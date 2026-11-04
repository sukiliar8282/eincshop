import * as paymentcryptography from "@distilled.cloud/aws/payment-cryptography";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
import { toWireDays } from "../../Util/Duration.js";
/**
 * An AWS Payment Cryptography key — a managed cryptographic key with TR-31
 * attributes (algorithm, class, usage, modes of use) used for data
 * encryption, MAC generation/verification, and other payment-domain
 * cryptographic operations.
 *
 * The key ARN is auto-assigned by the service; attach an {@link Alias} for a
 * stable human-readable identifier. Deletion schedules the key for removal
 * after a waiting window (minimum 3 days) during which it can be restored.
 * ### Creating Keys
 * **Example:** Symmetric data-encryption key
 * ```typescript
 * import * as PaymentCryptography from "alchemy/AWS/PaymentCryptography";
 *
 * const key = yield* PaymentCryptography.Key("DataKey", {
 *   keyAttributes: {
 *     keyAlgorithm: "AES_128",
 *     keyClass: "SYMMETRIC_KEY",
 *     keyUsage: "TR31_D0_SYMMETRIC_DATA_ENCRYPTION_KEY",
 *     keyModesOfUse: { encrypt: true, decrypt: true, wrap: true, unwrap: true },
 *   },
 * });
 * ```
 *
 * **Example:** HMAC key for MAC generation and verification
 * ```typescript
 * const macKey = yield* PaymentCryptography.Key("MacKey", {
 *   keyAttributes: {
 *     keyAlgorithm: "HMAC_SHA256",
 *     keyClass: "SYMMETRIC_KEY",
 *     keyUsage: "TR31_M7_HMAC_KEY",
 *     keyModesOfUse: { generate: true, verify: true },
 *   },
 * });
 * ```
 *
 * ### Managing Key State
 * **Example:** Disable a key without deleting it
 * ```typescript
 * const key = yield* PaymentCryptography.Key("DataKey", {
 *   keyAttributes: { ... },
 *   enabled: false,
 * });
 * ```
 *
 * ### Using Keys at Runtime
 * **Example:** Encrypt data from a Lambda handler
 * ```typescript
 * // init
 * const encrypt = yield* PaymentCryptography.EncryptData(key);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime — PlainText is hex-encoded
 *     const result = yield* encrypt({
 *       PlainText: "31323334353637383930313233343536",
 *       EncryptionAttributes: { Symmetric: { Mode: "CBC" } },
 *     });
 *     return HttpServerResponse.json({ cipherText: result.CipherText });
 *   }),
 * };
 * ```
 *
 * @resource
 */
export const Key = Resource("AWS.PaymentCryptography.Key");
const toWireKeyAttributes = (attributes) => ({
    KeyAlgorithm: attributes.keyAlgorithm,
    KeyClass: attributes.keyClass,
    KeyUsage: attributes.keyUsage,
    KeyModesOfUse: {
        Encrypt: attributes.keyModesOfUse.encrypt ?? false,
        Decrypt: attributes.keyModesOfUse.decrypt ?? false,
        Wrap: attributes.keyModesOfUse.wrap ?? false,
        Unwrap: attributes.keyModesOfUse.unwrap ?? false,
        Generate: attributes.keyModesOfUse.generate ?? false,
        Sign: attributes.keyModesOfUse.sign ?? false,
        Verify: attributes.keyModesOfUse.verify ?? false,
        DeriveKey: attributes.keyModesOfUse.deriveKey ?? false,
        NoRestrictions: attributes.keyModesOfUse.noRestrictions ?? false,
    },
});
const toAttrs = (key) => ({
    keyArn: key.KeyArn,
    keyState: key.KeyState,
    keyCheckValue: key.KeyCheckValue,
    enabled: key.Enabled,
    exportable: key.Exportable,
});
const tagsToRecord = (tags) => Object.fromEntries(tags.map((t) => [t.Key, t.Value ?? ""]));
const fetchKeyTags = (keyArn) => paymentcryptography.listTagsForResource.items({ ResourceArn: keyArn }).pipe(Stream.runCollect, Effect.map((chunk) => tagsToRecord(Array.from(chunk))), Effect.catch(() => Effect.succeed({})));
export const KeyProvider = () => Provider.effect(Key, Effect.gen(function* () {
    // Fetch a key by ARN; a missing or fully-deleted key observes as
    // `undefined`. A key inside its deletion window (DELETE_PENDING) is
    // still returned so reconcile can restore it.
    const observeKey = Effect.fn(function* (keyArn) {
        const found = yield* paymentcryptography
            .getKey({ KeyIdentifier: keyArn })
            .pipe(Effect.map((r) => r.Key), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        if (found === undefined || found.KeyState === "DELETE_COMPLETE") {
            return undefined;
        }
        return found;
    });
    // Keys have service-assigned identity (no name), so locating one
    // without a cached ARN falls back to scanning for the internal
    // Alchemy tags.
    const findKeyByTags = Effect.fn(function* (id) {
        const summaries = yield* paymentcryptography.listKeys.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).filter((k) => k.KeyState !== "DELETE_COMPLETE")));
        for (const summary of summaries) {
            const tags = yield* fetchKeyTags(summary.KeyArn);
            if (yield* hasAlchemyTags(id, tags)) {
                return summary.KeyArn;
            }
        }
        return undefined;
    });
    return Key.Provider.of({
        stables: ["keyArn", "keyCheckValue"],
        list: () => paymentcryptography.listKeys.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            // Keys already inside their deletion window are as deleted
            // as the API allows — a second DeleteKey is a no-op, so they
            // are not orphans (mirrors KMS PendingDeletion filtering).
            .filter((k) => k.KeyState !== "DELETE_PENDING" &&
            k.KeyState !== "DELETE_COMPLETE")
            .map((k) => ({
            keyArn: k.KeyArn,
            keyState: k.KeyState,
            keyCheckValue: k.KeyCheckValue,
            enabled: k.Enabled,
            exportable: k.Exportable,
        })))),
        read: Effect.fn(function* ({ id, output }) {
            const keyArn = output?.keyArn ?? (yield* findKeyByTags(id));
            if (keyArn === undefined)
                return undefined;
            const key = yield* observeKey(keyArn);
            if (key === undefined)
                return undefined;
            const attrs = toAttrs(key);
            const tags = yield* fetchKeyTags(key.KeyArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            const wireOld = toWireKeyAttributes(olds.keyAttributes);
            const wireNew = toWireKeyAttributes(news.keyAttributes);
            if (JSON.stringify(wireOld) !== JSON.stringify(wireNew) ||
                (olds.exportable ?? false) !== (news.exportable ?? false) ||
                olds.keyCheckValueAlgorithm !== news.keyCheckValueAlgorithm ||
                olds.deriveKeyUsage !== news.deriveKeyUsage) {
                return { action: "replace" };
            }
            // fall through: undefined → default update (enabled / tags sync)
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const desiredEnabled = news.enabled ?? true;
            const internalTags = yield* createInternalTags(id);
            // 1. Observe — output.keyArn is only an identity cache; the cloud
            //    is authoritative. Fall back to a tag scan for adoption after
            //    state-persistence failures.
            const cachedArn = output?.keyArn ?? (yield* findKeyByTags(id));
            let key = cachedArn === undefined ? undefined : yield* observeKey(cachedArn);
            // A key inside its deletion window is restored rather than
            // recreated — the material (and dependent ciphertext) survives.
            if (key !== undefined && key.KeyState === "DELETE_PENDING") {
                key = yield* paymentcryptography
                    .restoreKey({ KeyIdentifier: key.KeyArn })
                    .pipe(Effect.map((r) => r.Key));
            }
            // 2. Ensure — create when missing.
            if (key === undefined) {
                key = yield* paymentcryptography
                    .createKey({
                    KeyAttributes: toWireKeyAttributes(news.keyAttributes),
                    Exportable: news.exportable ?? false,
                    Enabled: desiredEnabled,
                    KeyCheckValueAlgorithm: news.keyCheckValueAlgorithm,
                    DeriveKeyUsage: news.deriveKeyUsage,
                    Tags: Object.entries({
                        ...news.tags,
                        ...internalTags,
                    }).map(([Key, Value]) => ({ Key, Value })),
                })
                    .pipe(Effect.map((r) => r.Key));
            }
            // 3a. Sync enabled state against OBSERVED cloud state.
            if (key.Enabled !== desiredEnabled) {
                key = desiredEnabled
                    ? yield* paymentcryptography
                        .startKeyUsage({ KeyIdentifier: key.KeyArn })
                        .pipe(Effect.map((r) => r.Key))
                    : yield* paymentcryptography
                        .stopKeyUsage({ KeyIdentifier: key.KeyArn })
                        .pipe(Effect.map((r) => r.Key));
            }
            // 3b. Sync tags — diff against observed cloud tags so adoption
            //     (foreign tags) converges.
            const observedTags = yield* fetchKeyTags(key.KeyArn);
            const desiredTags = {
                ...news.tags,
                ...internalTags,
            };
            const { upsert, removed } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* paymentcryptography.tagResource({
                    ResourceArn: key.KeyArn,
                    Tags: upsert,
                });
            }
            if (removed.length > 0) {
                yield* paymentcryptography.untagResource({
                    ResourceArn: key.KeyArn,
                    TagKeys: removed,
                });
            }
            yield* session.note(key.KeyArn);
            return toAttrs(key);
        }),
        delete: Effect.fn(function* ({ output, olds }) {
            yield* paymentcryptography
                .deleteKey({
                KeyIdentifier: output.keyArn,
                DeleteKeyInDays: toWireDays(olds.deleteWindow) ?? 3,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), 
            // A key already scheduled for deletion rejects a second
            // DeleteKey with a conflict — that is the desired end state,
            // so treat it as success. Any other conflict is re-raised.
            Effect.catchTag("ConflictException", (error) => paymentcryptography
                .getKey({ KeyIdentifier: output.keyArn })
                .pipe(Effect.flatMap((r) => r.Key.KeyState === "DELETE_PENDING" ||
                r.Key.KeyState === "DELETE_COMPLETE"
                ? Effect.void
                : Effect.fail(error)), Effect.catchTag("ResourceNotFoundException", () => Effect.void))));
        }),
    });
}));
//# sourceMappingURL=Key.js.map