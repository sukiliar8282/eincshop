import * as rolesanywhere from "@distilled.cloud/aws/rolesanywhere";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { toWireDays } from "../../Util/Duration.js";
import { readRolesAnywhereTags, syncRolesAnywhereTags, toWireTags, } from "./internal.js";
/**
 * Raised before any AWS call when the trust anchor's source is misconfigured
 * — exactly one of `certificateBundle` or `acmPcaArn` must be provided.
 */
export class TrustAnchorSourceConflict extends Data.TaggedError("TrustAnchorSourceConflict") {
}
/**
 * An IAM Roles Anywhere trust anchor. A trust anchor establishes trust
 * between IAM Roles Anywhere and your certificate authority (CA) — either an
 * uploaded PEM CA certificate bundle or a reference to an AWS Private CA.
 * Workloads outside AWS authenticate with certificates issued by the CA in
 * exchange for temporary AWS credentials.
 * ### Creating a Trust Anchor
 * **Example:** Certificate Bundle Trust Anchor
 * ```typescript
 * const anchor = yield* RolesAnywhere.TrustAnchor("Anchor", {
 *   certificateBundle: CA_CERTIFICATE_PEM,
 * });
 * ```
 *
 * **Example:** AWS Private CA Trust Anchor
 * ```typescript
 * const anchor = yield* RolesAnywhere.TrustAnchor("Anchor", {
 *   acmPcaArn: privateCa.certificateAuthorityArn,
 * });
 * ```
 *
 * ### Disabling a Trust Anchor
 * **Example:** Disabled Trust Anchor
 * ```typescript
 * const anchor = yield* RolesAnywhere.TrustAnchor("Anchor", {
 *   certificateBundle: CA_CERTIFICATE_PEM,
 *   enabled: false,
 * });
 * ```
 *
 * ### Expiry Notifications
 * **Example:** Custom Notification Threshold
 * ```typescript
 * const anchor = yield* RolesAnywhere.TrustAnchor("Anchor", {
 *   certificateBundle: CA_CERTIFICATE_PEM,
 *   notificationSettings: [
 *     { event: "CA_CERTIFICATE_EXPIRY", threshold: "30 days" },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const TrustAnchor = Resource("AWS.RolesAnywhere.TrustAnchor");
const toAttrs = (detail) => ({
    trustAnchorId: detail.trustAnchorId,
    trustAnchorArn: detail.trustAnchorArn,
    trustAnchorName: detail.name,
    enabled: detail.enabled ?? false,
});
const desiredSource = Effect.fn(function* (props) {
    if ((props.certificateBundle === undefined) ===
        (props.acmPcaArn === undefined)) {
        return yield* new TrustAnchorSourceConflict({
            message: "exactly one of certificateBundle or acmPcaArn must be provided",
        });
    }
    return props.certificateBundle !== undefined
        ? {
            sourceType: "CERTIFICATE_BUNDLE",
            sourceData: { x509CertificateData: props.certificateBundle.trim() },
        }
        : {
            sourceType: "AWS_ACM_PCA",
            sourceData: { acmPcaArn: props.acmPcaArn },
        };
});
/** The key AWS uses to identify a notification setting. */
const notificationKey = (setting) => `${setting.event}|${setting.channel ?? "ALL"}`;
const toWireNotificationSettings = (settings) => settings.map((setting) => ({
    enabled: setting.enabled ?? true,
    event: setting.event,
    threshold: toWireDays(setting.threshold),
    channel: setting.channel,
}));
const sourceDrift = (observed, desired) => {
    if (observed === undefined)
        return true;
    if (observed.sourceType !== desired.sourceType)
        return true;
    const observedData = observed.sourceData;
    const desiredData = desired.sourceData;
    if ("x509CertificateData" in desiredData) {
        return (observedData === undefined ||
            !("x509CertificateData" in observedData) ||
            observedData.x509CertificateData?.trim() !==
                desiredData.x509CertificateData);
    }
    return (observedData === undefined ||
        !("acmPcaArn" in observedData) ||
        observedData.acmPcaArn !== desiredData.acmPcaArn);
};
export const TrustAnchorProvider = () => Provider.effect(TrustAnchor, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.trustAnchorName ??
            (yield* createPhysicalName({ id, maxLength: 255 })));
    });
    /** Find a trust anchor by its user-facing name across all pages. */
    const findByName = (name) => rolesanywhere.listTrustAnchors.items({}).pipe(Stream.filter((detail) => detail.name === name), Stream.runHead, Effect.map((head) => (head._tag === "Some" ? head.value : undefined)));
    const getById = (trustAnchorId) => rolesanywhere.getTrustAnchor({ trustAnchorId }).pipe(Effect.map((r) => r.trustAnchor), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    return {
        stables: ["trustAnchorId", "trustAnchorArn"],
        read: Effect.fn(function* ({ id, olds, output }) {
            const found = output?.trustAnchorId
                ? yield* getById(output.trustAnchorId)
                : yield* findByName(yield* createName(id, olds ?? {}));
            if (found === undefined)
                return undefined;
            const attrs = toAttrs(found);
            const tags = yield* readRolesAnywhereTags(attrs.trustAnchorArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, olds, output, session }) {
            const name = output?.trustAnchorName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const source = yield* desiredSource(news);
            const desiredEnabled = news.enabled ?? true;
            const desiredNotifications = toWireNotificationSettings(news.notificationSettings ?? []);
            // 1. Observe — cloud state is authoritative; output caches the id.
            let live = output?.trustAnchorId
                ? yield* getById(output.trustAnchorId)
                : yield* findByName(name);
            // 2. Ensure — create if missing.
            if (live === undefined) {
                const created = yield* rolesanywhere.createTrustAnchor({
                    name,
                    source,
                    enabled: desiredEnabled,
                    tags: toWireTags(desiredTags),
                    notificationSettings: desiredNotifications.length > 0
                        ? desiredNotifications
                        : undefined,
                });
                live = created.trustAnchor;
            }
            else {
                // 3. Sync — converge name/source, then the enabled flag.
                const desiredName = news.trustAnchorName ?? live.name;
                if (live.name !== desiredName || sourceDrift(live.source, source)) {
                    const updated = yield* rolesanywhere.updateTrustAnchor({
                        trustAnchorId: live.trustAnchorId,
                        name: desiredName,
                        source,
                    });
                    live = updated.trustAnchor;
                }
            }
            // 3a. Sync notification settings — diff the OBSERVED settings
            // against the desired set. AWS installs default settings that must
            // not be touched unless the user manages that event/channel, so
            // resets are driven by the settings previously declared in `olds`
            // rather than full replacement of observed state.
            const observedNotifications = new Map((live.notificationSettings ?? []).map((setting) => [
                notificationKey(setting),
                setting,
            ]));
            const notificationDrift = desiredNotifications.some((desired) => {
                const observed = observedNotifications.get(notificationKey(desired));
                return (observed === undefined ||
                    observed.enabled !== desired.enabled ||
                    (desired.threshold !== undefined &&
                        observed.threshold !== desired.threshold));
            });
            if (notificationDrift) {
                const updated = yield* rolesanywhere.putNotificationSettings({
                    trustAnchorId: live.trustAnchorId,
                    notificationSettings: desiredNotifications,
                });
                live = updated.trustAnchor;
            }
            const desiredNotificationKeys = new Set(desiredNotifications.map(notificationKey));
            const resetKeys = (olds?.notificationSettings ?? [])
                .filter((previous) => !desiredNotificationKeys.has(notificationKey(previous)))
                .map((previous) => ({
                event: previous.event,
                channel: previous.channel,
            }));
            if (resetKeys.length > 0) {
                const reset = yield* rolesanywhere
                    .resetNotificationSettings({
                    trustAnchorId: live.trustAnchorId,
                    notificationSettingKeys: resetKeys,
                })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
                live = reset?.trustAnchor ?? live;
            }
            if ((live.enabled ?? false) !== desiredEnabled) {
                // The enable/disable response can echo the pre-toggle state — the
                // successful call itself is authoritative for the flag.
                yield* desiredEnabled
                    ? rolesanywhere.enableTrustAnchor({
                        trustAnchorId: live.trustAnchorId,
                    })
                    : rolesanywhere.disableTrustAnchor({
                        trustAnchorId: live.trustAnchorId,
                    });
                live = { ...live, enabled: desiredEnabled };
            }
            // 3b. Sync tags against observed cloud tags.
            yield* syncRolesAnywhereTags(live.trustAnchorArn, desiredTags);
            yield* session.note(live.trustAnchorId);
            return toAttrs(live);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* rolesanywhere
                .deleteTrustAnchor({ trustAnchorId: output.trustAnchorId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
        list: () => rolesanywhere.listTrustAnchors.items({}).pipe(Stream.map(toAttrs), Stream.runCollect, Effect.map((chunk) => Array.from(chunk))),
    };
}));
//# sourceMappingURL=TrustAnchor.js.map