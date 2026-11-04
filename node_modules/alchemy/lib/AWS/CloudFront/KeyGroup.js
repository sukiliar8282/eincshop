import * as cloudfront from "@distilled.cloud/aws/cloudfront";
import * as Effect from "effect/Effect";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A CloudFront key group.
 *
 * Key groups bundle one or more {@link PublicKey} resources for use as
 * `TrustedKeyGroups` on a Distribution's cache behavior. CloudFront uses
 * the keys in the group to verify the signatures on signed URLs and
 * signed cookies for that behavior.
 * ### Creating Key Groups
 * **Example:** Group two public keys for signed URL verification
 * ```typescript
 * const primary = yield* PublicKey("PrimarySigningKey", {
 *   encodedKey: yield* fs.readFileString("./primary.pem"),
 * });
 * const secondary = yield* PublicKey("SecondarySigningKey", {
 *   encodedKey: yield* fs.readFileString("./secondary.pem"),
 * });
 *
 * const keyGroup = yield* KeyGroup("SignedUrlKeys", {
 *   comment: "Trusted signers for /private",
 *   items: [primary.publicKeyId, secondary.publicKeyId],
 * });
 * ```
 *
 * @resource
 */
export const KeyGroup = Resource("AWS.CloudFront.KeyGroup");
export const KeyGroupProvider = () => Provider.effect(KeyGroup, Effect.gen(function* () {
    const getById = Effect.fn(function* (id) {
        const config = yield* cloudfront
            .getKeyGroupConfig({ Id: id })
            .pipe(Effect.catchTag("NoSuchResource", () => Effect.succeed(undefined)));
        if (!config?.KeyGroupConfig)
            return undefined;
        return { config: config.KeyGroupConfig, etag: config.ETag };
    });
    const getByName = Effect.fn(function* (name) {
        const listed = yield* cloudfront.listKeyGroups({});
        const summary = listed.KeyGroupList?.Items?.find((item) => item.KeyGroup?.KeyGroupConfig?.Name === name);
        if (!summary?.KeyGroup?.Id)
            return undefined;
        return yield* getById(summary.KeyGroup.Id).pipe(Effect.map((found) => found ? { id: summary.KeyGroup.Id, ...found } : undefined));
    });
    const buildConfig = (name, items, comment) => ({
        Name: name,
        Items: items,
        Comment: comment,
    });
    const toAttrs = (id, config, etag) => ({
        keyGroupId: id,
        name: config.Name,
        items: config.Items,
        etag,
        comment: config.Comment,
    });
    return {
        stables: ["keyGroupId"],
        list: () => Effect.gen(function* () {
            const items = [];
            let marker = undefined;
            do {
                const listed = yield* cloudfront.listKeyGroups({ Marker: marker });
                for (const summary of listed.KeyGroupList?.Items ?? []) {
                    const id = summary.KeyGroup?.Id;
                    const config = summary.KeyGroup?.KeyGroupConfig;
                    if (!id || !config)
                        continue;
                    // The list summary omits the ETag; re-read each group to
                    // produce the exact Attributes shape `read` returns.
                    const found = yield* getById(id);
                    items.push(toAttrs(id, found?.config ?? config, found?.etag));
                }
                marker = listed.KeyGroupList?.NextMarker;
            } while (marker);
            return items;
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* createName(id, olds ?? {})) !==
                (yield* createName(id, news))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            if (output?.keyGroupId) {
                const found = yield* getById(output.keyGroupId);
                if (found)
                    return toAttrs(output.keyGroupId, found.config, found.etag);
            }
            const name = yield* createName(id, olds ?? {});
            const found = yield* getByName(name);
            if (!found)
                return undefined;
            return toAttrs(found.id, found.config, found.etag);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = yield* createName(id, news);
            const items = news.items;
            // Observe — locate the key group by id (cached on `output`) or
            // by name. Trust observed cloud state, not stale `olds`.
            let observed = output?.keyGroupId
                ? yield* getById(output.keyGroupId).pipe(Effect.map((found) => found ? { id: output.keyGroupId, ...found } : undefined))
                : undefined;
            if (!observed) {
                observed = yield* getByName(name);
            }
            // Ensure — create the key group if it's missing. Tolerate
            // `KeyGroupAlreadyExists` (race with a peer reconciler).
            if (!observed) {
                const created = yield* cloudfront
                    .createKeyGroup({
                    KeyGroupConfig: buildConfig(name, items, news.comment),
                })
                    .pipe(Effect.catchTag("KeyGroupAlreadyExists", () => getByName(name).pipe(Effect.flatMap((existing) => existing
                    ? Effect.succeed({
                        KeyGroup: {
                            Id: existing.id,
                            LastModifiedTime: new Date(),
                            KeyGroupConfig: existing.config,
                        },
                        ETag: existing.etag,
                        Location: undefined,
                    })
                    : Effect.fail(new Error(`Key group '${name}' already exists but could not be recovered`))))));
                if (!created.KeyGroup?.Id) {
                    return yield* Effect.fail(new Error("createKeyGroup returned no identifier"));
                }
                yield* session.note(created.KeyGroup.Id);
                return toAttrs(created.KeyGroup.Id, created.KeyGroup.KeyGroupConfig, created.ETag);
            }
            // Sync — patch the observed config to the desired state. The
            // freshly observed ETag handles optimistic concurrency.
            const updated = yield* cloudfront.updateKeyGroup({
                Id: observed.id,
                IfMatch: observed.etag,
                KeyGroupConfig: buildConfig(observed.config.Name, items, news.comment),
            });
            if (!updated.KeyGroup?.Id) {
                return yield* Effect.fail(new Error("updateKeyGroup returned no identifier"));
            }
            yield* session.note(observed.id);
            return toAttrs(updated.KeyGroup.Id, updated.KeyGroup.KeyGroupConfig, updated.ETag);
        }),
        delete: Effect.fn(function* ({ output }) {
            const current = yield* getById(output.keyGroupId);
            if (!current)
                return;
            yield* cloudfront
                .deleteKeyGroup({
                Id: output.keyGroupId,
                IfMatch: current.etag,
            })
                .pipe(Effect.catchTag("NoSuchResource", () => Effect.void));
        }),
    };
}));
const createName = (id, props) => props.name
    ? Effect.succeed(props.name)
    : createPhysicalName({ id, maxLength: 128, lowercase: true });
//# sourceMappingURL=KeyGroup.js.map