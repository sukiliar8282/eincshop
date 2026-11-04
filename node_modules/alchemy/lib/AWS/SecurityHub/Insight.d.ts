import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface InsightProps {
    /**
     * Name of the insight. If omitted, a unique name is generated. Updatable
     * in place.
     */
    name?: string;
    /**
     * The finding filters the insight aggregates over, e.g.
     * `{ SeverityLabel: [{ Value: "CRITICAL", Comparison: "EQUALS" }] }`.
     * Updatable in place.
     */
    filters: securityhub.AwsSecurityFindingFilters;
    /**
     * The finding attribute results are grouped by, e.g. `ResourceId`,
     * `SeverityLabel`, `AwsAccountId`. Updatable in place.
     */
    groupByAttribute: string;
}
/** @resource */
export interface Insight extends Resource<"AWS.SecurityHub.Insight", InsightProps, {
    /** ARN of the insight (its identity). */
    insightArn: string;
    /** Name of the insight. */
    name: string;
    /** The attribute results are grouped by. */
    groupByAttribute: string;
}, never, Providers> {
}
/**
 * A Security Hub custom insight — a saved finding query grouped by an
 * attribute. Read its aggregated results at runtime with the
 * {@link GetInsightResults} binding.
 *
 * ### Creating an Insight
 * **Example:** Critical Findings by Resource
 * ```typescript
 * const insight = yield* AWS.SecurityHub.Insight("CriticalByResource", {
 *   filters: {
 *     SeverityLabel: [{ Value: "CRITICAL", Comparison: "EQUALS" }],
 *     RecordState: [{ Value: "ACTIVE", Comparison: "EQUALS" }],
 *   },
 *   groupByAttribute: "ResourceId",
 * });
 * ```
 *
 * **Example:** Read Insight Results at Runtime
 * ```typescript
 * const getInsightResults = yield* AWS.SecurityHub.GetInsightResults();
 * const { InsightResults } = yield* getInsightResults({
 *   InsightArn: insight.insightArn,
 * });
 * ```
 */
declare const InsightResource: import("../../Resource.ts").ResourceClass<Insight>;
export { InsightResource as Insight };
export declare const InsightProvider: () => import("effect/Layer").Layer<Provider.Provider<Insight>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Insight.d.ts.map