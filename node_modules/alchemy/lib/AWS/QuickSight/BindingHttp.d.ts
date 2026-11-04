import * as Effect from "effect/Effect";
import type { Dashboard } from "./Dashboard.ts";
import type { DataSet } from "./DataSet.ts";
/**
 * Shared scaffolding for Amazon QuickSight HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the scoping resource, and the IAM
 * action list is boilerplate.
 *
 * Every QuickSight API call requires the `AwsAccountId`. The runtime half of
 * each binding derives it from the bound resource's ARN
 * (`arn:aws:quicksight:{region}:{account}:{type}/{id}`), so no extra
 * environment plumbing is needed inside the Lambda.
 */
/** Extract the AWS account id from a QuickSight resource ARN. */
export declare const accountIdFromArn: (arn: string) => string;
/**
 * Build the impl Effect for a QuickSight operation scoped to a
 * {@link Dashboard}: the deploy-time half grants `actions` on the bound
 * dashboard's ARN, and the runtime half injects `AwsAccountId` (parsed from
 * the dashboard ARN) and `DashboardId` into every request.
 */
export declare const makeQuickSightDashboardHttpBinding: <I extends {
    AwsAccountId: string;
    DashboardId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.QuickSight.StartDashboardSnapshotJob`. */
    tag: string;
    /** The distilled operation; `AwsAccountId` and `DashboardId` are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the dashboard ARN. */
    actions: readonly string[];
}) => Effect.Effect<(dashboard: Dashboard) => Effect.Effect<(request: Omit<I, "AwsAccountId" | "DashboardId">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a QuickSight operation scoped to a
 * {@link DataSet}: the deploy-time half grants `actions` on the bound
 * dataset's ARN and its `…/ingestion/*` sub-resources, and the runtime half
 * injects `AwsAccountId` (parsed from the dataset ARN) and `DataSetId` into
 * every request.
 */
export declare const makeQuickSightDataSetHttpBinding: <I extends {
    AwsAccountId: string;
    DataSetId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.QuickSight.CreateIngestion`. */
    tag: string;
    /** The distilled operation; `AwsAccountId` and `DataSetId` are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the dataset ARN + its ingestion sub-resources. */
    actions: readonly string[];
}) => Effect.Effect<(dataSet: DataSet) => Effect.Effect<(request?: Omit<I, "AwsAccountId" | "DataSetId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a QuickSight embed-URL operation scoped to a
 * {@link Dashboard}: the deploy-time half grants `actions` on `*` (embed-URL
 * actions authorize against user/namespace ARNs that are unknown at deploy
 * time), and the runtime half injects `AwsAccountId` and defaults the
 * experience configuration to the bound dashboard via `applyDefaults`.
 */
export declare const makeQuickSightEmbedHttpBinding: <I extends {
    AwsAccountId: string;
}, Req, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.QuickSight.GenerateEmbedUrlForRegisteredUser`. */
    tag: string;
    /** The distilled operation; `AwsAccountId` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
    /** Fill dashboard-derived defaults into the caller's request. */
    applyDefaults: (request: Req, dashboard: {
        dashboardId: string;
        arn: string;
    }) => Omit<I, "AwsAccountId">;
}) => Effect.Effect<(dashboard: Dashboard) => Effect.Effect<(request: Req) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map