import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Action applied to findings that match the filter's criteria: `NONE` keeps
 * them visible (a saved view), `SUPPRESS` hides them from default views.
 */
export type FilterAction = "NONE" | "SUPPRESS";
export interface FilterProps {
    /**
     * Name of the filter. If omitted, a unique name is generated. Updatable in
     * place — the filter's identity is its ARN.
     */
    name?: string;
    /**
     * Action applied to findings that match the criteria: `NONE` keeps them
     * visible, `SUPPRESS` hides them (a suppression rule). Updatable in place.
     */
    action: FilterAction;
    /**
     * The criteria findings are matched against, e.g.
     * `{ severity: [{ comparison: "EQUALS", value: "INFORMATIONAL" }] }`.
     * Updatable in place.
     */
    filterCriteria: inspector2.FilterCriteria;
    /**
     * Human-readable description of the filter. Updatable in place.
     */
    description?: string;
    /**
     * The reason for creating the filter (shown in the console next to
     * suppressed findings). Updatable in place.
     */
    reason?: string;
    /**
     * Tags applied to the filter. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface Filter extends Resource<"AWS.Inspector2.Filter", FilterProps, {
    /** ARN of the filter (its identity). */
    arn: string;
    /** Name of the filter. */
    name: string;
    /** Account that owns the filter. */
    ownerId: string;
    /** Action applied to matching findings. */
    action: FilterAction;
    /** Description of the filter. */
    description: string | undefined;
    /** Reason recorded for the filter. */
    reason: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon Inspector findings filter — matches findings against criteria
 * and either keeps them visible (`NONE`, a saved view) or suppresses them
 * (`SUPPRESS`, a suppression rule). Everything is updatable in place; the
 * filter's identity is its ARN.
 *
 * ### Suppressing Findings
 * **Example:** Suppress informational findings
 * ```typescript
 * const filter = yield* AWS.Inspector2.Filter("SuppressInfo", {
 *   action: "SUPPRESS",
 *   reason: "Informational findings are tracked elsewhere",
 *   filterCriteria: {
 *     severity: [{ comparison: "EQUALS", value: "INFORMATIONAL" }],
 *   },
 * });
 * ```
 *
 * **Example:** Saved view of one repository's findings
 * ```typescript
 * const filter = yield* AWS.Inspector2.Filter("RepoView", {
 *   name: "payments-repository",
 *   action: "NONE",
 *   filterCriteria: {
 *     ecrImageRepositoryName: [{ comparison: "EQUALS", value: "payments" }],
 *   },
 * });
 * ```
 */
declare const FilterResource: import("../../Resource.ts").ResourceClass<Filter>;
export { FilterResource as Filter };
export declare const FilterProvider: () => import("effect/Layer").Layer<Provider.Provider<Filter>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Filter.d.ts.map