import * as appsignals from "@distilled.cloud/aws/application-signals";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface GroupingConfigurationProps {
    /**
     * The custom grouping attribute definitions for this account. Each
     * definition names a grouping dimension (`GroupingName`), the telemetry
     * attribute or AWS tag keys it is sourced from (`GroupingSourceKeys`,
     * e.g. `"Tag.team"` or an OTel resource attribute key), and an optional
     * `DefaultGroupingValue` used when none of the source keys are present.
     */
    groupingAttributeDefinitions: appsignals.GroupingAttributeDefinition[];
}
export interface GroupingConfiguration extends Resource<"AWS.ApplicationSignals.GroupingConfiguration", GroupingConfigurationProps, {
    /**
     * The grouping attribute definitions as returned by the service.
     */
    groupingAttributeDefinitions: appsignals.GroupingAttributeDefinition[];
    /**
     * When the grouping configuration was last updated (ISO timestamp).
     */
    updatedAt: string | undefined;
}, never, Providers> {
}
/**
 * The CloudWatch Application Signals grouping configuration for this
 * account — an account-level singleton that defines custom grouping
 * attributes (sourced from telemetry attributes or AWS tags) used to
 * organize and filter discovered services in the Application Signals
 * console and APIs.
 *
 * There is at most ONE grouping configuration per account/region;
 * `PutGroupingConfiguration` replaces the whole definition list.
 *
 * ### Creating a Grouping Configuration
 * **Example:** Group Services by Team Tag
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const grouping = yield* AWS.ApplicationSignals.GroupingConfiguration(
 *   "Grouping",
 *   {
 *     groupingAttributeDefinitions: [
 *       {
 *         GroupingName: "Team",
 *         GroupingSourceKeys: ["Tag.team"],
 *         DefaultGroupingValue: "unassigned",
 *       },
 *     ],
 *   },
 * );
 * ```
 *
 * **Example:** Multiple Grouping Dimensions
 * ```typescript
 * const grouping = yield* AWS.ApplicationSignals.GroupingConfiguration(
 *   "Grouping",
 *   {
 *     groupingAttributeDefinitions: [
 *       { GroupingName: "Team", GroupingSourceKeys: ["Tag.team"] },
 *       {
 *         GroupingName: "CostCenter",
 *         GroupingSourceKeys: ["Tag.cost-center", "business_unit"],
 *         DefaultGroupingValue: "shared",
 *       },
 *     ],
 *   },
 * );
 * ```
 *
 * @resource
 */
export declare const GroupingConfiguration: import("../../Resource.ts").ResourceClass<GroupingConfiguration>;
export declare const GroupingConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<GroupingConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GroupingConfiguration.d.ts.map