import * as Effect from "effect/Effect";
import { Region } from "../Region.ts";
import type { ReportDefinition } from "./ReportDefinition.ts";
/**
 * Build the impl Effect for an account-level CUR operation.
 * `cur:DescribeReportDefinitions` enumerates every report definition in the
 * account, so the grant is on `Resource: ["*"]`.
 */
export declare const makeCurHttpBinding: <I extends object, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"DescribeReportDefinitions"`.
     */
    capability: string;
    /** IAM actions granted on `Resource: ["*"]`. */
    iamActions: readonly string[];
    /** The distilled operation implementing the capability. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, Exclude<R, Region>>;
/**
 * Build the impl Effect for an operation scoped to one
 * {@link ReportDefinition}. The runtime callable injects the bound report's
 * name as the request's `ReportName`; the deploy-time half grants
 * `iamActions` on the report definition's ARN
 * (`arn:aws:cur:us-east-1:{account}:definition/{name}`).
 */
export declare const makeReportDefinitionHttpBinding: <I extends {
    ReportName?: string;
}, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"ListTagsForResource"`.
     */
    capability: string;
    /** IAM actions granted on the report definition's ARN. */
    iamActions: readonly string[];
    /** The distilled operation; `ReportName` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<(report: ReportDefinition) => Effect.Effect<(request?: Omit<I, "ReportName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, Exclude<R, Region>>;
//# sourceMappingURL=BindingHttp.d.ts.map