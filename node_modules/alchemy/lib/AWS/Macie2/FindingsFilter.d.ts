import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Action applied to findings that match the filter's criteria: `ARCHIVE`
 * suppresses them, `NOOP` keeps them visible.
 */
export type FindingsFilterAction = "ARCHIVE" | "NOOP";
export interface FindingsFilterProps {
    /**
     * Custom name for the filter (3-64 characters). Must be unique per account.
     * If omitted, a unique name is generated from the app/stage/logical ID.
     * Updatable in place.
     */
    name?: string;
    /**
     * Custom description of the filter (up to 512 characters). Updatable in
     * place.
     */
    description?: string;
    /**
     * The action taken on findings that match the criteria: `ARCHIVE`
     * (suppress) or `NOOP` (keep visible). Updatable in place.
     * @default "NOOP"
     */
    action?: FindingsFilterAction;
    /**
     * The position of the filter relative to other filters (evaluated in
     * ascending order). Updatable in place.
     */
    position?: number;
    /**
     * The criteria findings are matched against, e.g.
     * `{ criterion: { severity.description: { eq: ["Low"] } } }`. Updatable in
     * place.
     */
    findingCriteria: macie2.FindingCriteria;
    /**
     * Tags applied to the filter. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface FindingsFilter extends Resource<"AWS.Macie2.FindingsFilter", FindingsFilterProps, {
    /** Generated findings filter ID. */
    id: string;
    /** ARN of the findings filter. */
    arn: string;
    /** The resolved filter name. */
    name: string;
    /** The action applied to matching findings. */
    action: FindingsFilterAction;
}, never, Providers> {
}
/**
 * An Amazon Macie findings filter — matches findings against criteria and
 * either keeps (`NOOP`) or auto-suppresses (`ARCHIVE`) them. Requires Macie to
 * be enabled for the account (see `Macie2.Session`). Name, description,
 * action, position, and criteria are all updatable in place.
 *
 * ### Filtering findings
 * **Example:** Suppress low-severity findings
 * ```typescript
 * const filter = yield* Macie2.FindingsFilter("LowSeverity", {
 *   action: "ARCHIVE",
 *   position: 1,
 *   findingCriteria: {
 *     criterion: { "severity.description": { eq: ["Low"] } },
 *   },
 * });
 * ```
 *
 * **Example:** Keep a named filter for the console
 * ```typescript
 * const filter = yield* Macie2.FindingsFilter("ProdBuckets", {
 *   name: "prod-buckets-only",
 *   description: "Findings on production buckets",
 *   findingCriteria: {
 *     criterion: {
 *       "resourcesAffected.s3Bucket.name": { eq: ["prod-data"] },
 *     },
 *   },
 * });
 * ```
 */
declare const FindingsFilterResource: import("../../Resource.ts").ResourceClass<FindingsFilter>;
export { FindingsFilterResource as FindingsFilter };
export declare const FindingsFilterProvider: () => import("effect/Layer").Layer<Provider.Provider<FindingsFilter>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=FindingsFilter.d.ts.map