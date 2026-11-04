import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Effect from "effect/Effect";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, tagRecord, } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * The Security Hub Hub — the account/region singleton that enables AWS Security
 * Hub. Only one Hub can exist per region, so this is a capture-and-restore
 * singleton: adopting a pre-existing Hub that Alchemy did not create requires
 * `--adopt`.
 *
 * ### Enabling Security Hub
 * **Example:** Enable with default standards
 * ```typescript
 * const hub = yield* SecurityHub.Hub("Hub", {});
 * ```
 *
 * **Example:** Enable without default standards, auto-enable controls
 * ```typescript
 * const hub = yield* SecurityHub.Hub("Hub", {
 *   enableDefaultStandards: false,
 *   autoEnableControls: true,
 *   controlFindingGenerator: "SECURITY_CONTROL",
 *   tags: { team: "security" },
 * });
 * ```
 */
const HubResource = Resource("AWS.SecurityHub.Hub");
export { HubResource as Hub };
const hubArnFallback = (region, accountId) => `arn:aws:securityhub:${region}:${accountId}:hub/default`;
const buildAttrs = (hub) => ({
    hubArn: hub.HubArn,
    subscribedAt: hub.SubscribedAt,
    autoEnableControls: hub.AutoEnableControls,
    controlFindingGenerator: hub.ControlFindingGenerator,
});
// `describeHub` throws `InvalidAccessException` when the account is not
// subscribed and `ResourceNotFoundException` transiently right after enable —
// both mean "no Hub", so collapse them to `undefined`.
const describeHub = securityhub.describeHub({}).pipe(Effect.catchTag("InvalidAccessException", () => Effect.succeed(undefined)), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
export const HubProvider = () => Provider.effect(HubResource, Effect.gen(function* () {
    const readTags = (arn) => securityhub.listTagsForResource({ ResourceArn: arn }).pipe(Effect.map((r) => tagRecord(r.Tags)), Effect.catch(() => Effect.succeed({})));
    return {
        read: Effect.fn(function* ({ id }) {
            const hub = yield* describeHub;
            if (!hub)
                return undefined;
            const attrs = buildAttrs(hub);
            const tags = yield* readTags(attrs.hubArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        // Security Hub is an account/region singleton — `describeHub` returns
        // the single Hub or throws when unsubscribed.
        list: () => describeHub.pipe(Effect.map((hub) => (hub ? [buildAttrs(hub)] : []))),
        reconcile: Effect.fn(function* ({ id, news = {}, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE
            let hub = yield* describeHub;
            // 2. ENSURE — enable Security Hub if not already subscribed.
            if (!hub) {
                yield* securityhub.enableSecurityHub({
                    Tags: desiredTags,
                    EnableDefaultStandards: news.enableDefaultStandards ?? true,
                    ControlFindingGenerator: news.controlFindingGenerator,
                });
                hub = yield* securityhub.describeHub({});
            }
            const arn = hub.HubArn ?? hubArnFallback(region, accountId);
            // 3. SYNC configuration — observed ↔ desired.
            const configChanged = (news.autoEnableControls !== undefined &&
                news.autoEnableControls !== hub.AutoEnableControls) ||
                (news.controlFindingGenerator !== undefined &&
                    news.controlFindingGenerator !== hub.ControlFindingGenerator);
            if (configChanged) {
                yield* securityhub.updateSecurityHubConfiguration({
                    AutoEnableControls: news.autoEnableControls,
                    ControlFindingGenerator: news.controlFindingGenerator,
                });
            }
            // 3b. SYNC tags — diff against OBSERVED cloud tags.
            const currentTags = yield* readTags(arn);
            const { upsert, removed } = diffTags(currentTags, desiredTags);
            if (upsert.length > 0) {
                yield* securityhub.tagResource({
                    ResourceArn: arn,
                    Tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                });
            }
            if (removed.length > 0) {
                yield* securityhub.untagResource({
                    ResourceArn: arn,
                    TagKeys: removed,
                });
            }
            // 4. RETURN fresh attributes.
            const final = yield* securityhub.describeHub({});
            yield* session.note(arn);
            return buildAttrs(final);
        }),
        delete: Effect.fn(function* () {
            yield* securityhub.disableSecurityHub({}).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.catchTag("InvalidAccessException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Hub.js.map