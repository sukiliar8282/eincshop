import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, tagRecord, } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * A GuardDuty trusted IP set — an S3-hosted list of IP addresses GuardDuty
 * treats as trusted, suppressing findings for traffic from them. The list
 * file must exist in S3 before activation; name, location, and activation
 * are updatable in place, while format changes replace the set.
 *
 * ### Trusting Known IPs
 * **Example:** Trust the office IP range
 * ```typescript
 * const detector = yield* AWS.GuardDuty.Detector("Detector", {});
 * const ipSet = yield* AWS.GuardDuty.IPSet("OfficeIPs", {
 *   detectorId: detector.detectorId,
 *   format: "TXT",
 *   location: "https://s3.amazonaws.com/my-security-bucket/office-ips.txt",
 * });
 * ```
 *
 * **Example:** Stage a list without activating it
 * ```typescript
 * const ipSet = yield* AWS.GuardDuty.IPSet("StagedIPs", {
 *   detectorId: detector.detectorId,
 *   format: "TXT",
 *   location: "https://s3.amazonaws.com/my-security-bucket/staged.txt",
 *   activate: false,
 * });
 * ```
 */
const IPSetResource = Resource("AWS.GuardDuty.IPSet");
export { IPSetResource as IPSet };
const ipSetArn = (region, accountId, detectorId, ipSetId) => `arn:aws:guardduty:${region}:${accountId}:detector/${detectorId}/ipset/${ipSetId}`;
/** Statuses that count as "the set is (becoming) active". */
const ACTIVE_STATUSES = ["ACTIVE", "ACTIVATING"];
export const IPSetProvider = () => Provider.effect(IPSetResource, Effect.gen(function* () {
    const toName = (id, props) => props.name
        ? Effect.succeed(props.name)
        : createPhysicalName({ id, maxLength: 64 });
    const getIPSet = (detectorId, ipSetId) => guardduty
        .getIPSet({ DetectorId: detectorId, IpSetId: ipSetId })
        .pipe(Effect.catchTag("BadRequestException", () => Effect.succeed(undefined)));
    // Recover the set id after state loss by matching the deterministic
    // name across the detector's IP sets.
    const findByName = Effect.fn(function* (detectorId, name) {
        const pages = yield* guardduty.listIPSets
            .pages({ DetectorId: detectorId })
            .pipe(Stream.runCollect);
        for (const ipSetId of Array.from(pages).flatMap((page) => page.IpSetIds ?? [])) {
            const s = yield* getIPSet(detectorId, ipSetId);
            if (s?.Name === name && s.Status !== "DELETE_PENDING") {
                return { ipSetId, set: s };
            }
        }
        return undefined;
    });
    const buildAttrs = Effect.fn(function* (detectorId, ipSetId, s) {
        const { accountId, region } = yield* AWSEnvironment.current;
        return {
            detectorId,
            ipSetId,
            ipSetArn: ipSetArn(region, accountId, detectorId, ipSetId),
            name: s.Name,
            format: s.Format,
            location: s.Location,
            status: s.Status,
        };
    });
    return {
        stables: ["detectorId", "ipSetId", "ipSetArn"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return;
            if (olds === undefined)
                return;
            if (olds.detectorId !== news.detectorId ||
                olds.format !== news.format) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const detectorId = output?.detectorId ?? olds?.detectorId;
            if (!detectorId)
                return undefined;
            let ipSetId = output?.ipSetId;
            let set = ipSetId ? yield* getIPSet(detectorId, ipSetId) : undefined;
            if (!set) {
                const found = yield* findByName(detectorId, yield* toName(id, olds ?? {}));
                if (!found)
                    return undefined;
                ({ ipSetId, set } = found);
            }
            const attrs = yield* buildAttrs(detectorId, ipSetId, set);
            return (yield* hasAlchemyTags(id, set.Tags)) ? attrs : Unowned(attrs);
        }),
        list: () => Effect.gen(function* () {
            const { DetectorIds } = yield* guardduty.listDetectors({});
            const out = [];
            for (const detectorId of DetectorIds ?? []) {
                const pages = yield* guardduty.listIPSets
                    .pages({ DetectorId: detectorId })
                    .pipe(Stream.runCollect);
                for (const ipSetId of Array.from(pages).flatMap((page) => page.IpSetIds ?? [])) {
                    const s = yield* getIPSet(detectorId, ipSetId);
                    if (s)
                        out.push(yield* buildAttrs(detectorId, ipSetId, s));
                }
            }
            return out;
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const detectorId = news.detectorId;
            const name = yield* toName(id, news);
            const desiredActivate = news.activate ?? true;
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE — output.ipSetId is only a cache; fall back to a
            // name search so a crash-and-retry converges.
            let ipSetId = output?.ipSetId;
            let live = ipSetId ? yield* getIPSet(detectorId, ipSetId) : undefined;
            if (!live) {
                const found = yield* findByName(detectorId, name);
                if (found)
                    ({ ipSetId, set: live } = found);
            }
            if (!live || !ipSetId) {
                // 2. ENSURE — create with tags applied inline.
                const created = yield* guardduty.createIPSet({
                    DetectorId: detectorId,
                    Name: name,
                    Format: news.format,
                    Location: news.location,
                    Activate: desiredActivate,
                    ExpectedBucketOwner: news.expectedBucketOwner,
                    Tags: desiredTags,
                });
                ipSetId = created.IpSetId;
            }
            else {
                // 3. SYNC settings — observed ↔ desired.
                const observedActive = ACTIVE_STATUSES.includes(live.Status);
                const drift = live.Name !== name ||
                    live.Location !== news.location ||
                    observedActive !== desiredActivate;
                if (drift) {
                    yield* guardduty.updateIPSet({
                        DetectorId: detectorId,
                        IpSetId: ipSetId,
                        Name: name,
                        Location: news.location,
                        Activate: desiredActivate,
                        ExpectedBucketOwner: news.expectedBucketOwner,
                    });
                }
                // 3b. SYNC tags — diff against OBSERVED cloud tags.
                const { accountId, region } = yield* AWSEnvironment.current;
                const arn = ipSetArn(region, accountId, detectorId, ipSetId);
                const { upsert, removed } = diffTags(tagRecord(live.Tags), desiredTags);
                if (upsert.length > 0) {
                    yield* guardduty.tagResource({
                        ResourceArn: arn,
                        Tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                    });
                }
                if (removed.length > 0) {
                    yield* guardduty.untagResource({
                        ResourceArn: arn,
                        TagKeys: removed,
                    });
                }
            }
            // 4. RETURN fresh attributes.
            const final = yield* guardduty.getIPSet({
                DetectorId: detectorId,
                IpSetId: ipSetId,
            });
            yield* session.note(`${detectorId}/${ipSetId}`);
            return yield* buildAttrs(detectorId, ipSetId, final);
        }),
        delete: Effect.fn(function* ({ output }) {
            // Idempotent — the set (or its whole detector) may already be
            // gone; both surface as BadRequestException.
            yield* guardduty
                .deleteIPSet({
                DetectorId: output.detectorId,
                IpSetId: output.ipSetId,
            })
                .pipe(Effect.catchTag("BadRequestException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=IPSet.js.map