import * as guardduty from "@distilled.cloud/aws/guardduty";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/** Action taken on findings that match the filter's criteria. */
export type FilterAction = "NOOP" | "ARCHIVE";
export interface FilterProps {
    /**
     * ID of the detector the filter belongs to. Changing this replaces the
     * filter.
     */
    detectorId: string;
    /**
     * Name of the filter (3-64 alphanumeric, `.`, `_`, `-` characters). If
     * omitted, a unique name is generated. Changing this replaces the filter.
     */
    name?: string;
    /**
     * Human-readable description of the filter. Updatable in place.
     */
    description?: string;
    /**
     * Action applied to findings that match the criteria: `NOOP` keeps them
     * visible, `ARCHIVE` auto-archives them. Updatable in place.
     * @default "NOOP"
     */
    action?: FilterAction;
    /**
     * Position of the filter relative to other filters (1 is evaluated first).
     * Updatable in place.
     */
    rank?: number;
    /**
     * The criteria findings are matched against, e.g.
     * `{ Criterion: { severity: { Gte: 7 } } }`. Updatable in place.
     */
    findingCriteria: guardduty.FindingCriteria;
    /**
     * Tags applied to the filter. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface Filter extends Resource<"AWS.GuardDuty.Filter", FilterProps, {
    /** ID of the detector the filter belongs to. */
    detectorId: string;
    /** Name of the filter (its identity within the detector). */
    name: string;
    /** ARN of the filter. */
    filterArn: string;
    /** Action applied to matching findings. */
    action: FilterAction;
    /** Description of the filter. */
    description: string | undefined;
    /** Evaluation rank of the filter. */
    rank: number | undefined;
}, never, Providers> {
}
/**
 * A GuardDuty findings filter — matches findings against criteria and either
 * keeps (`NOOP`) or auto-archives (`ARCHIVE`) them. Identity is the
 * `(detectorId, name)` pair; description, action, rank, and criteria are
 * updatable in place.
 *
 * ### Filtering Findings
 * **Example:** Auto-archive low-severity findings
 * ```typescript
 * const detector = yield* AWS.GuardDuty.Detector("Detector", {});
 * const filter = yield* AWS.GuardDuty.Filter("LowSeverity", {
 *   detectorId: detector.detectorId,
 *   action: "ARCHIVE",
 *   rank: 1,
 *   findingCriteria: { Criterion: { severity: { LessThan: 4 } } },
 * });
 * ```
 *
 * **Example:** Keep a named filter for the console
 * ```typescript
 * const filter = yield* AWS.GuardDuty.Filter("ProdOnly", {
 *   detectorId: detector.detectorId,
 *   name: "prod-only",
 *   description: "Findings on production resources",
 *   findingCriteria: {
 *     Criterion: { "resource.instanceDetails.tags.value": { Equals: ["prod"] } },
 *   },
 * });
 * ```
 */
declare const FilterResource: import("../../Resource.ts").ResourceClass<Filter>;
export { FilterResource as Filter };
export declare const FilterProvider: () => import("effect/Layer").Layer<Provider.Provider<Filter>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Filter.d.ts.map