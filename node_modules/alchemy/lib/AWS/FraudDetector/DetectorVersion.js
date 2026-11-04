import * as frauddetector from "@distilled.cloud/aws/frauddetector";
import * as Effect from "effect/Effect";
import { deepEqual, isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags } from "../../Tags.js";
import { syncFraudDetectorTags } from "./internal.js";
/**
 * An Amazon Fraud Detector detector version — the deployable revision of a
 * detector. It bundles a set of rules (owned inline here) over the detector's
 * event type and, when `ACTIVE`, serves real-time predictions via
 * `getEventPrediction`. Rules and the version are cheap, rule-based
 * configuration objects — no model training is involved.
 *
 * ### Creating a Detector Version
 * **Example:** Active Version with One Rule
 * ```typescript
 * const version = yield* FraudDetector.DetectorVersion("v1", {
 *   detectorId: detector.detectorId,
 *   status: "ACTIVE",
 *   ruleExecutionMode: "FIRST_MATCHED",
 *   rules: [
 *     {
 *       ruleId: "high_risk",
 *       expression: '$email == "fraud@example.com"',
 *       outcomes: ["review"],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const DetectorVersion = Resource("AWS.FraudDetector.DetectorVersion");
export const DetectorVersionProvider = () => Provider.effect(DetectorVersion, Effect.gen(function* () {
    /** Read a detector version by id; typed not-found → undefined. */
    const getVersion = Effect.fn(function* (detectorId, detectorVersionId) {
        return yield* frauddetector
            .getDetectorVersion({ detectorId, detectorVersionId })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    /**
     * Ensure every declared rule exists as a rule version and return the
     * references (create-once by `ruleId`; existing rules reuse their latest
     * version — rule-expression edits are expressed by changing `ruleId`).
     */
    const ensureRules = Effect.fn(function* (detectorId, rules) {
        const refs = [];
        for (const rule of rules) {
            const existing = yield* frauddetector
                .getRules({ detectorId, ruleId: rule.ruleId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            const details = existing?.ruleDetails ?? [];
            if (details.length === 0) {
                const created = yield* frauddetector.createRule({
                    ruleId: rule.ruleId,
                    detectorId,
                    expression: rule.expression,
                    language: rule.language ?? "DETECTORPL",
                    outcomes: rule.outcomes,
                    description: rule.description,
                });
                refs.push(created.rule);
            }
            else {
                // Reuse the latest existing version of the rule.
                const latest = details.reduce((a, b) => Number(b.ruleVersion ?? "0") > Number(a.ruleVersion ?? "0")
                    ? b
                    : a);
                refs.push({
                    detectorId,
                    ruleId: latest.ruleId,
                    ruleVersion: latest.ruleVersion,
                });
            }
        }
        return refs;
    });
    return {
        stables: ["detectorId", "detectorVersionId", "arn"],
        diff: Effect.fn(function* ({ olds = {}, news }) {
            if (!isResolved(news))
                return undefined;
            // Everything but status is baked into the published version — a
            // change to the detector, rules, execution mode, or description
            // replaces the version. Status transitions happen in place.
            if ((olds.detectorId ?? undefined) !== (news.detectorId ?? undefined) ||
                (olds.ruleExecutionMode ?? undefined) !==
                    (news.ruleExecutionMode ?? undefined) ||
                (olds.description ?? undefined) !==
                    (news.description ?? undefined) ||
                !deepEqual(olds.rules, news.rules)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ output }) {
            if (output?.detectorVersionId === undefined)
                return undefined;
            const version = yield* getVersion(output.detectorId, output.detectorVersionId);
            if (version === undefined)
                return undefined;
            return {
                detectorId: version.detectorId,
                detectorVersionId: version.detectorVersionId,
                arn: version.arn,
                status: version.status,
            };
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const detectorId = news.detectorId;
            const desiredStatus = news.status ?? "ACTIVE";
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. ENSURE the rules exist and collect their version references.
            const ruleRefs = yield* ensureRules(detectorId, news.rules);
            // 2. OBSERVE the version; create it if missing. Published versions
            //    are immutable, so any content change triggers replacement (see
            //    diff) — here we only ever create or converge status/tags.
            let detectorVersionId = output?.detectorVersionId;
            let version = detectorVersionId !== undefined
                ? yield* getVersion(detectorId, detectorVersionId)
                : undefined;
            if (version === undefined) {
                const created = yield* frauddetector.createDetectorVersion({
                    detectorId,
                    description: news.description,
                    rules: ruleRefs,
                    ruleExecutionMode: news.ruleExecutionMode,
                    tags: Object.entries(desiredTags).map(([key, value]) => ({
                        key,
                        value,
                    })),
                });
                detectorVersionId = created.detectorVersionId;
                version = yield* getVersion(detectorId, detectorVersionId);
            }
            // 3. SYNC status — a new version is created in DRAFT; move it to the
            //    desired status if it drifts.
            if ((version.status ?? undefined) !== desiredStatus) {
                yield* frauddetector.updateDetectorVersionStatus({
                    detectorId,
                    detectorVersionId: detectorVersionId,
                    status: desiredStatus,
                });
            }
            // 4. SYNC tags — diff against OBSERVED cloud tags.
            yield* syncFraudDetectorTags(version.arn, desiredTags);
            yield* session.note(detectorVersionId);
            return {
                detectorId,
                detectorVersionId: detectorVersionId,
                arn: version.arn,
                status: desiredStatus,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            const { detectorId, detectorVersionId } = output;
            // Read the rules the version owns before removing it so we can clean
            // them up afterwards (rules block detector deletion otherwise).
            const version = yield* getVersion(detectorId, detectorVersionId);
            const rules = version?.rules ?? [];
            // A version must be INACTIVE before it can be deleted.
            yield* frauddetector
                .updateDetectorVersionStatus({
                detectorId,
                detectorVersionId,
                status: "INACTIVE",
            })
                .pipe(Effect.catchTag([
                "ValidationException",
                "ConflictException",
                "ResourceNotFoundException",
            ], () => Effect.void));
            yield* frauddetector
                .deleteDetectorVersion({ detectorId, detectorVersionId })
                .pipe(Effect.catchTag([
                "ValidationException",
                "ConflictException",
                "ResourceNotFoundException",
            ], () => Effect.void));
            // Best-effort cleanup of the owned rule versions.
            for (const rule of rules) {
                yield* frauddetector
                    .deleteRule({ rule })
                    .pipe(Effect.catchTag(["ValidationException", "ConflictException"], () => Effect.void));
            }
        }),
        // Detector versions are sub-resources keyed by their parent detector;
        // there is no account-wide enumeration op, so list is a no-op.
        list: () => Effect.succeed([]),
    };
}));
//# sourceMappingURL=DetectorVersion.js.map