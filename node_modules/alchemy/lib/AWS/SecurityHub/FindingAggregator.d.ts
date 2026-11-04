import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * How linked Regions are selected for cross-Region finding aggregation.
 */
export type RegionLinkingMode = "ALL_REGIONS" | "ALL_REGIONS_EXCEPT_SPECIFIED" | "SPECIFIED_REGIONS" | "NO_REGIONS";
export interface FindingAggregatorProps {
    /**
     * How linked Regions are selected: `ALL_REGIONS` aggregates from every
     * Region (including future ones), `ALL_REGIONS_EXCEPT_SPECIFIED` excludes
     * `regions`, `SPECIFIED_REGIONS` includes only `regions`, and `NO_REGIONS`
     * disables aggregation. Updatable in place.
     */
    regionLinkingMode: RegionLinkingMode;
    /**
     * The Regions excluded from (`ALL_REGIONS_EXCEPT_SPECIFIED`) or included
     * in (`SPECIFIED_REGIONS`) aggregation. Updatable in place.
     */
    regions?: string[];
}
/** @resource */
export interface FindingAggregator extends Resource<"AWS.SecurityHub.FindingAggregator", FindingAggregatorProps, {
    /** ARN of the finding aggregator (its identity). */
    findingAggregatorArn: string;
    /** The home Region findings are aggregated into. */
    findingAggregationRegion: string | undefined;
    /** The active Region-linking mode. */
    regionLinkingMode: string | undefined;
    /** The Regions included in or excluded from aggregation. */
    regions: string[] | undefined;
}, never, Providers> {
}
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
declare const FindingAggregatorResource: import("../../Resource.ts").ResourceClass<FindingAggregator>;
export { FindingAggregatorResource as FindingAggregator };
export declare const FindingAggregatorProvider: () => import("effect/Layer").Layer<Provider.Provider<FindingAggregator>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=FindingAggregator.d.ts.map