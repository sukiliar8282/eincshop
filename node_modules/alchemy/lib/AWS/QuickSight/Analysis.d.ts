import * as quicksight from "@distilled.cloud/aws/quicksight";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Properties for an Amazon QuickSight analysis — an editable workspace built
 * from a template or an inline definition, which can be published as a
 * dashboard.
 */
export interface AnalysisProps {
    /**
     * Unique id of the analysis within the account. Stable — changing it
     * replaces the analysis. If omitted, a unique id is generated.
     */
    analysisId?: string;
    /**
     * Display name of the analysis.
     */
    name: string;
    /**
     * Source of the analysis content — a template to clone. Provide either
     * `sourceEntity` or `definition`.
     */
    sourceEntity?: quicksight.AnalysisSourceEntity;
    /**
     * Inline definition of the analysis content. Provide either `definition`
     * or `sourceEntity`.
     */
    definition?: quicksight.AnalysisDefinition;
    /**
     * Parameters passed to the analysis's datasets.
     */
    parameters?: quicksight.Parameters;
    /**
     * Resource-level permissions on the analysis.
     */
    permissions?: quicksight.ResourcePermission[];
    /**
     * ARN of the theme applied to the analysis.
     */
    themeArn?: string;
    /**
     * When deleting, whether to skip the recovery window and delete
     * immediately. Recommended for ephemeral/test analyses so they don't
     * linger in a recoverable state.
     * @default true
     */
    forceDeleteWithoutRecovery?: boolean;
    /**
     * Tags to apply to the analysis.
     */
    tags?: Record<string, string>;
}
export interface Analysis extends Resource<"AWS.QuickSight.Analysis", AnalysisProps, {
    /** Unique id of the analysis within the account. */
    analysisId: string;
    /** ARN of the analysis. */
    arn: string;
    /** Display name of the analysis. */
    name: string;
    /** Current lifecycle status (e.g. `CREATION_SUCCESSFUL`). */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon QuickSight analysis — an editable workspace built from a template
 * or an inline definition, which can be published as a dashboard.
 *
 * QuickSight requires an active account subscription in the region. Without
 * one, create operations fail with the typed `QuickSightSubscriptionRequired`
 * error.
 *
 * ### Creating an Analysis
 * **Example:** Analysis from a Template
 * ```typescript
 * const analysis = yield* Analysis("explore-sales", {
 *   name: "Explore Sales",
 *   sourceEntity: {
 *     SourceTemplate: {
 *       Arn: templateArn,
 *       DataSetReferences: [
 *         { DataSetPlaceholder: "sales", DataSetArn: dataset.arn },
 *       ],
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Analysis: import("../../Resource.ts").ResourceClass<Analysis>;
export declare const AnalysisProvider: () => import("effect/Layer").Layer<Provider.Provider<Analysis>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Analysis.d.ts.map