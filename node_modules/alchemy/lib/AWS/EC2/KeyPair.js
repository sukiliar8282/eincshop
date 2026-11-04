import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags, hasTags, } from "../../Tags.js";
/**
 * An EC2 key pair used to grant SSH access to instances launched with its
 * `keyName`.
 *
 * By default Alchemy asks EC2 to generate the key pair and captures the
 * private key (returned only once, at create time) as a secret in state. Pass
 * {@link KeyPairProps.publicKeyMaterial} to import your own public key instead,
 * in which case no private key is stored.
 *
 * ### Creating a Key Pair
 * **Example:** Generated key pair
 * ```typescript
 * const keyPair = yield* AWS.EC2.KeyPair("DeployKey", {
 *   keyType: "ed25519",
 * });
 * // keyPair.keyName       -> pass to AWS.EC2.Instance({ keyName })
 * // keyPair.privateKey    -> Redacted<string> (the PEM private key)
 * ```
 *
 * **Example:** Imported public key
 * ```typescript
 * const keyPair = yield* AWS.EC2.KeyPair("ImportedKey", {
 *   publicKeyMaterial: "ssh-ed25519 AAAAC3Nz... user@host",
 * });
 * ```
 *
 * @resource
 */
export const KeyPair = Resource("AWS.EC2.KeyPair");
const toKeyName = (id, props = {}) => props.keyName
    ? Effect.succeed(props.keyName)
    : createPhysicalName({ id, maxLength: 255 });
const asRedacted = (material) => material === undefined
    ? undefined
    : Redacted.isRedacted(material)
        ? material
        : Redacted.make(material);
export const KeyPairProvider = () => Provider.effect(KeyPair, Effect.gen(function* () {
    const describeByName = (keyName) => ec2.describeKeyPairs({ KeyNames: [keyName] }).pipe(Effect.catchTag("InvalidKeyPair.NotFound", () => Effect.succeed({ KeyPairs: [] })), Effect.map((r) => r.KeyPairs?.[0]));
    return {
        stables: ["keyPairId", "keyName", "keyType"],
        // Generated key pairs are immutable except for tags. A changed name /
        // type / format / imported material means a different key pair.
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return;
            const oldName = yield* toKeyName(id, olds ?? {});
            const newName = yield* toKeyName(id, news);
            if (oldName !== newName ||
                (olds?.keyType ?? "rsa") !== (news.keyType ?? "rsa") ||
                (olds?.keyFormat ?? "pem") !== (news.keyFormat ?? "pem") ||
                olds?.publicKeyMaterial !== news.publicKeyMaterial) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const keyName = output?.keyName ?? (yield* toKeyName(id, olds ?? {}));
            const info = yield* describeByName(keyName);
            if (!info?.KeyPairId)
                return undefined;
            const tags = yield* createInternalTags(id);
            const observedTags = Object.fromEntries((info.Tags ?? []).map((t) => [t.Key ?? "", t.Value]));
            if (!hasTags(tags, observedTags)) {
                // Exists but unbranded — let the engine gate adoption behind --adopt.
                return Unowned({
                    keyPairId: info.KeyPairId,
                    keyName: info.KeyName ?? keyName,
                    keyFingerprint: info.KeyFingerprint ?? "",
                    keyType: (info.KeyType ?? "rsa"),
                    // Private key is only available at create time; keep any cached
                    // copy from prior state.
                    privateKey: output?.privateKey,
                });
            }
            return {
                keyPairId: info.KeyPairId,
                keyName: info.KeyName ?? keyName,
                keyFingerprint: info.KeyFingerprint ?? output?.keyFingerprint ?? "",
                keyType: (info.KeyType ?? output?.keyType ?? "rsa"),
                privateKey: output?.privateKey,
            };
        }),
        list: () => Effect.gen(function* () {
            const result = yield* ec2.describeKeyPairs({});
            return (result.KeyPairs ?? [])
                .filter((kp) => kp.KeyPairId != null && kp.KeyName != null)
                .filter((kp) => (kp.Tags ?? []).some((t) => t.Key === "alchemy::stack"))
                .map((kp) => ({
                keyPairId: kp.KeyPairId,
                keyName: kp.KeyName,
                keyFingerprint: kp.KeyFingerprint ?? "",
                keyType: (kp.KeyType ?? "rsa"),
                privateKey: undefined,
            }));
        }),
        reconcile: Effect.fn(function* ({ id, news = {}, output, session }) {
            const keyName = output?.keyName ?? (yield* toKeyName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — is the key pair already present?
            let info = yield* describeByName(keyName);
            let privateKey = output?.privateKey;
            // Ensure — import or generate when missing.
            if (!info?.KeyPairId) {
                if (news.publicKeyMaterial !== undefined) {
                    const imported = yield* ec2
                        .importKeyPair({
                        KeyName: keyName,
                        PublicKeyMaterial: new TextEncoder().encode(news.publicKeyMaterial),
                        TagSpecifications: [
                            {
                                ResourceType: "key-pair",
                                Tags: createTagsList(desiredTags),
                            },
                        ],
                    })
                        .pipe(Effect.catchTag("InvalidKeyPair.Duplicate", () => Effect.succeed(undefined)));
                    if (imported?.KeyPairId) {
                        info = {
                            KeyPairId: imported.KeyPairId,
                            KeyName: imported.KeyName,
                            KeyFingerprint: imported.KeyFingerprint,
                            KeyType: "rsa",
                        };
                    }
                    else {
                        info = yield* describeByName(keyName);
                    }
                }
                else {
                    const created = yield* ec2
                        .createKeyPair({
                        KeyName: keyName,
                        KeyType: news.keyType ?? "rsa",
                        KeyFormat: news.keyFormat ?? "pem",
                        TagSpecifications: [
                            {
                                ResourceType: "key-pair",
                                Tags: createTagsList(desiredTags),
                            },
                        ],
                    })
                        .pipe(Effect.catchTag("InvalidKeyPair.Duplicate", () => Effect.succeed(undefined)));
                    if (created?.KeyPairId) {
                        privateKey = asRedacted(created.KeyMaterial) ?? privateKey;
                        info = {
                            KeyPairId: created.KeyPairId,
                            KeyName: created.KeyName,
                            KeyFingerprint: created.KeyFingerprint,
                            KeyType: (news.keyType ?? "rsa"),
                        };
                    }
                    else {
                        info = yield* describeByName(keyName);
                    }
                }
            }
            if (!info?.KeyPairId) {
                return yield* Effect.die(new Error(`Failed to resolve EC2 key pair '${keyName}'`));
            }
            const keyPairId = info.KeyPairId;
            // Sync tags — observed cloud tags vs desired.
            const observedTags = Object.fromEntries((info.Tags ?? []).map((t) => [t.Key, t.Value]));
            const { removed, upsert } = diffTags(observedTags, desiredTags);
            if (removed.length > 0) {
                yield* ec2.deleteTags({
                    Resources: [keyPairId],
                    Tags: removed.map((key) => ({ Key: key })),
                });
            }
            if (upsert.length > 0) {
                yield* ec2.createTags({ Resources: [keyPairId], Tags: upsert });
            }
            yield* session.note(`Key pair ${keyName} (${keyPairId})`);
            return {
                keyPairId,
                keyName: info.KeyName ?? keyName,
                keyFingerprint: info.KeyFingerprint ?? "",
                keyType: (info.KeyType ?? news.keyType ?? "rsa"),
                privateKey,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // `deleteKeyPair` is idempotent — deleting a missing key pair
            // succeeds, so there is no NotFound error to catch.
            yield* ec2.deleteKeyPair({ KeyPairId: output.keyPairId });
        }),
    };
}));
//# sourceMappingURL=KeyPair.js.map