import * as quicksight from "@distilled.cloud/aws/quicksight";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Properties for an Amazon QuickSight dashboard — a published, read-only view
 * built from a template, an analysis, or an inline definition.
 */
export interface DashboardProps {
    /**
     * Unique id of the dashboard within the account. Stable — changing it
     * replaces the dashboard. If omitted, a unique id is generated.
     */
    dashboardId?: string;
    /**
     * Display name of the dashboard.
     */
    name: string;
    /**
     * Source of the dashboard content — a template or an existing analysis to
     * clone. Provide either `sourceEntity` or `definition`.
     */
    sourceEntity?: quicksight.DashboardSourceEntity;
    /**
     * Inline definition of the dashboard content. Provide either `definition`
     * or `sourceEntity`.
     */
    definition?: quicksight.DashboardVersionDefinition;
    /**
     * Parameters passed to the dashboard's datasets.
     */
    parameters?: quicksight.Parameters;
    /**
     * Resource-level permissions on the dashboard.
     */
    permissions?: quicksight.ResourcePermission[];
    /**
     * Publish options (e.g. ad-hoc filtering, export to CSV).
     */
    dashboardPublishOptions?: quicksight.DashboardPublishOptions;
    /**
     * ARN of the theme applied to the dashboard.
     */
    themeArn?: string;
    /**
     * Description of the created/updated version.
     */
    versionDescription?: string;
    /**
     * Tags to apply to the dashboard.
     */
    tags?: Record<string, string>;
}
export interface Dashboard extends Resource<"AWS.QuickSight.Dashboard", DashboardProps, {
    /** Unique id of the dashboard within the account. */
    dashboardId: string;
    /** ARN of the dashboard. */
    arn: string;
    /** Display name of the dashboard. */
    name: string;
    /** Current version status (e.g. `CREATION_SUCCESSFUL`). */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon QuickSight dashboard — a published, read-only view built from a
 * template, an analysis, or an inline definition.
 *
 * QuickSight requires an active account subscription in the region. Without
 * one, create operations fail with the typed `QuickSightSubscriptionRequired`
 * error.
 *
 * ### Creating a Dashboard
 * **Example:** Dashboard from a Template
 * ```typescript
 * const dashboard = yield* Dashboard("sales-overview", {
 *   name: "Sales Overview",
 *   sourceEntity: {
 *     SourceTemplate: {
 *       Arn: templateArn,
 *       DataSetReferences: [
 *         {
 *           DataSetPlaceholder: "sales",
 *           DataSetArn: dataset.arn,
 *         },
 *       ],
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Dashboard: import("../../Resource.ts").ResourceClass<Dashboard>;
export declare const DashboardProvider: () => import("effect/Layer").Layer<Provider.Provider<Dashboard>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Dashboard.d.ts.map