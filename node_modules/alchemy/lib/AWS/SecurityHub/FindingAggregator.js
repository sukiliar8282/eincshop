import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Effect from "effect/Effect";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * The Security Hub cross-Region finding aggregator — replicates findings
 * from linked Regions into the home Region. Only one aggregator can exist
 * per account, so this is a singleton: adopting a pre-existing aggregator
 * that Alchemy did not create requires `--adopt`.
 *
 * ### Aggregating Findings Across Regions
 * **Example:** Aggregate from All Regions
 * ```typescript
 * const aggregator = yield* AWS.SecurityHub.FindingAggregator("Aggregator", {
 *   regionLinkingMode: "ALL_REGIONS",
 * });
 * ```
 *
 * **Example:** Aggregate from Specific Regions
 * ```typescript
 * const aggregator = yield* AWS.SecurityHub.FindingAggregator("Aggregator", {
 *   regionLinkingMode: "SPECIFIED_REGIONS",
 *   regions: ["us-east-1", "eu-west-1"],
 * });
 * ```
 */
const FindingAggregatorResource = Resource("AWS.SecurityHub.FindingAggregator");
export { FindingAggregatorResource as FindingAggregator };
export const FindingAggregatorProvider = () => Provider.effect(FindingAggregatorResource, Effect.gen(function* () {
    const getAggregator = (arn) => securityhub.getFindingAggregator({ FindingAggregatorArn: arn }).pipe(Effect.map((r) => r), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)), Effect.catchTag("InvalidAccessException", () => Effect.succeed(undefined)));
    // At most one aggregator exists per account — a single page suffices.
    const findAggregator = securityhub.listFindingAggregators({}).pipe(Effect.map((r) => r.FindingAggregators?.[0]?.FindingAggregatorArn), Effect.catchTag("InvalidAccessException", () => Effect.succeed(undefined)));
    const buildAttrs = (r) => ({
        findingAggregatorArn: r.FindingAggregatorArn,
        findingAggregationRegion: r.FindingAggregationRegion,
        regionLinkingMode: r.RegionLinkingMode,
        regions: r.Regions,
    });
    return {
        stables: ["findingAggregatorArn", "findingAggregationRegion"],
        read: Effect.fn(function* ({ output }) {
            if (output?.findingAggregatorArn) {
                const live = yield* getAggregator(output.findingAggregatorArn);
                return live ? buildAttrs(live) : undefined;
            }
            // Aggregators cannot be tagged; an existing one we have no state
            // for is foreign until adopted.
            const arn = yield* findAggregator;
            if (!arn)
                return undefined;
            const live = yield* getAggregator(arn);
            return live ? Unowned(buildAttrs(live)) : undefined;
        }),
        list: () => Effect.gen(function* () {
            const arn = yield* findAggregator;
            if (!arn)
                return [];
            const live = yield* getAggregator(arn);
            return live ? [buildAttrs(live)] : [];
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            // 1. OBSERVE — the account's single aggregator is authoritative.
            const arn = output?.findingAggregatorArn ?? (yield* findAggregator);
            const live = arn ? yield* getAggregator(arn) : undefined;
            let final;
            if (!live) {
                // 2. ENSURE.
                final = yield* securityhub.createFindingAggregator({
                    RegionLinkingMode: news.regionLinkingMode,
                    Regions: news.regions,
                });
            }
            else if (live.RegionLinkingMode !== news.regionLinkingMode ||
                // The API returns Regions in normalized order — compare as sets.
                JSON.stringify([...(live.Regions ?? [])].sort()) !==
                    JSON.stringify([...(news.regions ?? [])].sort())) {
                // 3. SYNC — observed ↔ desired.
                final = yield* securityhub.updateFindingAggregator({
                    FindingAggregatorArn: live.FindingAggregatorArn,
                    RegionLinkingMode: news.regionLinkingMode,
                    Regions: news.regions,
                });
            }
            else {
                final = live;
            }
            // 4. RETURN fresh attributes.
            yield* session.note(final.FindingAggregatorArn);
            return buildAttrs(final);
        }),
        delete: Effect.fn(function* ({ output }) {
            // Idempotent — the aggregator (or the whole hub) may already be gone.
            yield* securityhub
                .deleteFindingAggregator({
                FindingAggregatorArn: output.findingAggregatorArn,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.catchTag("InvalidAccessException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=FindingAggregator.js.map