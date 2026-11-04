import * as controltower from "@distilled.cloud/aws/controltower";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { canonicalJson, observeControlTowerTags, syncControlTowerTags, } from "./internal.js";
/**
 * An AWS Control Tower landing zone — the org-wide multi-account
 * environment (organization structure, governed regions, centralized
 * logging, and access management) that Control Tower governs.
 *
 * A landing zone is a singleton per AWS Organization and can only be
 * managed from the Organizations management account. Creating, updating,
 * and decommissioning a landing zone are asynchronous operations that can
 * take an hour or more.
 * ### Creating a Landing Zone
 * **Example:** Landing Zone from a manifest
 * ```typescript
 * import * as ControlTower from "alchemy/AWS/ControlTower";
 *
 * const landingZone = yield* ControlTower.LandingZone("LandingZone", {
 *   version: "3.3",
 *   manifest: {
 *     governedRegions: ["us-east-1", "us-west-2"],
 *     organizationStructure: {
 *       security: { name: "Security" },
 *       sandbox: { name: "Sandbox" },
 *     },
 *     centralizedLogging: {
 *       accountId: "111122223333",
 *       configurations: {
 *         loggingBucket: { retentionDays: 365 },
 *         accessLoggingBucket: { retentionDays: 365 },
 *       },
 *       enabled: true,
 *     },
 *     securityRoles: { accountId: "444455556666" },
 *     accessManagement: { enabled: true },
 *   },
 * });
 * ```
 *
 * ### Upgrading
 * **Example:** Upgrade the landing zone version
 * ```typescript
 * const landingZone = yield* ControlTower.LandingZone("LandingZone", {
 *   version: "3.3", // bump to upgrade in place
 *   manifest,
 * });
 * ```
 *
 * @resource
 */
export const LandingZone = Resource("AWS.ControlTower.LandingZone");
/**
 * An asynchronous landing zone operation (CREATE / UPDATE / DELETE /
 * RESET) converged to the terminal `FAILED` status.
 */
export class LandingZoneOperationFailed extends Data.TaggedError("LandingZoneOperationFailed") {
}
/**
 * Internal signal that a landing zone operation is still `IN_PROGRESS`,
 * consumed by {@link waitForLandingZoneOperation}'s bounded schedule.
 */
class LandingZoneOperationPending extends Data.TaggedError("LandingZoneOperationPending") {
}
// Explicitly-typed retry wrapper — an inline `Effect.retry` in provider
// lifecycle code leaks `Retry.Return`'s conditional type into declaration
// emit and widens the provider layer to `unknown` for every consumer of
// `AWS.providers()`.
const retryWhileLandingZoneOperationPending = (self) => Effect.retry(self, {
    while: (e) => e._tag === "LandingZoneOperationPending",
    // Landing zone operations routinely take ~60 minutes; poll every 30s
    // up to 90 minutes (bounded).
    schedule: Schedule.max([
        Schedule.spaced("30 seconds"),
        Schedule.recurs(180),
    ]),
});
const waitForLandingZoneOperation = (operationIdentifier) => retryWhileLandingZoneOperationPending(Effect.gen(function* () {
    const { operationDetails } = yield* controltower.getLandingZoneOperation({
        operationIdentifier,
    });
    if (operationDetails.status === "SUCCEEDED") {
        return;
    }
    if (operationDetails.status === "FAILED") {
        return yield* Effect.fail(new LandingZoneOperationFailed({
            operationIdentifier,
            status: operationDetails.status,
            statusMessage: operationDetails.statusMessage,
        }));
    }
    return yield* Effect.fail(new LandingZoneOperationPending({
        operationIdentifier,
        status: operationDetails.status,
    }));
}));
// A landing zone is a singleton per organization — `listLandingZones`
// returns at most one ARN.
const findLandingZoneArn = controltower.listLandingZones.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .flatMap((page) => page.landingZones)
    .map((zone) => zone.arn)
    .find((arn) => arn !== undefined)));
const readLandingZone = (landingZoneIdentifier) => controltower.getLandingZone({ landingZoneIdentifier }).pipe(Effect.map((r) => r.landingZone), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
const toAttributes = (arn, detail) => ({
    landingZoneIdentifier: arn,
    landingZoneArn: arn,
    version: detail.version,
    status: detail.status,
    latestAvailableVersion: detail.latestAvailableVersion,
    driftStatus: detail.driftStatus?.status,
});
export const LandingZoneProvider = () => Provider.effect(LandingZone, Effect.gen(function* () {
    return LandingZone.Provider.of({
        stables: ["landingZoneIdentifier", "landingZoneArn"],
        // Decommissioning a landing zone dismantles org-wide governance
        // (an irreversible, ~1 hour operation) — never do it from `nuke`.
        nuke: { skip: true },
        list: () => Effect.gen(function* () {
            const arn = yield* findLandingZoneArn;
            if (arn === undefined)
                return [];
            const detail = yield* readLandingZone(arn);
            if (detail === undefined)
                return [];
            return [toAttributes(arn, detail)];
        }),
        read: Effect.fn(function* ({ id, output }) {
            const arn = output?.landingZoneArn ?? (yield* findLandingZoneArn);
            if (arn === undefined)
                return undefined;
            const detail = yield* readLandingZone(arn);
            if (detail === undefined)
                return undefined;
            const attrs = toAttributes(arn, detail);
            const tags = yield* observeControlTowerTags(arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            // 1. Observe — the landing zone is an org singleton; enumerate
            //    rather than trusting a cached identifier.
            let arn = output?.landingZoneArn ?? (yield* findLandingZoneArn);
            let detail = arn === undefined ? undefined : yield* readLandingZone(arn);
            // 2. Ensure — create if missing and wait for the asynchronous
            //    operation to converge.
            if (detail === undefined) {
                const internalTags = yield* createInternalTags(id);
                const created = yield* controltower.createLandingZone({
                    version: news.version,
                    manifest: news.manifest,
                    remediationTypes: news.remediationTypes,
                    tags: { ...news.tags, ...internalTags },
                });
                arn = created.arn;
                yield* session.note(`landing zone operation ${created.operationIdentifier}`);
                yield* waitForLandingZoneOperation(created.operationIdentifier);
                detail = yield* readLandingZone(arn);
            }
            else {
                // 3. Sync — version / manifest / remediation types are updated
                //    in place; diff observed cloud state against desired and
                //    skip the (very slow) update API on a no-op.
                const versionChanged = detail.version !== news.version;
                const manifestChanged = canonicalJson(detail.manifest ?? {}) !==
                    canonicalJson(news.manifest);
                const remediationChanged = news.remediationTypes !== undefined &&
                    canonicalJson([...(detail.remediationTypes ?? [])].sort()) !==
                        canonicalJson([...news.remediationTypes].sort());
                if (versionChanged || manifestChanged || remediationChanged) {
                    const updated = yield* controltower.updateLandingZone({
                        landingZoneIdentifier: arn,
                        version: news.version,
                        manifest: news.manifest,
                        remediationTypes: news.remediationTypes,
                    });
                    yield* session.note(`landing zone operation ${updated.operationIdentifier}`);
                    yield* waitForLandingZoneOperation(updated.operationIdentifier);
                    detail = yield* readLandingZone(arn);
                }
            }
            // 3b. Sync tags against observed cloud tags.
            yield* syncControlTowerTags(arn, id, news.tags);
            // 4. Return fresh attributes.
            return detail === undefined
                ? {
                    landingZoneIdentifier: arn,
                    landingZoneArn: arn,
                    version: news.version,
                    status: undefined,
                    latestAvailableVersion: undefined,
                    driftStatus: undefined,
                }
                : toAttributes(arn, detail);
        }),
        delete: Effect.fn(function* ({ output, session }) {
            const result = yield* controltower
                .deleteLandingZone({
                landingZoneIdentifier: output.landingZoneArn,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (result !== undefined) {
                yield* session.note(`landing zone operation ${result.operationIdentifier}`);
                yield* waitForLandingZoneOperation(result.operationIdentifier);
            }
        }),
    });
}));
//# sourceMappingURL=LandingZone.js.map