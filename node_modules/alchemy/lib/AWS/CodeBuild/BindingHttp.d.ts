import * as Effect from "effect/Effect";
import type { Project } from "./Project.ts";
import type { ReportGroup } from "./ReportGroup.ts";
/**
 * Shared scaffolding for AWS CodeBuild HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the IAM action, and (for
 * name-injecting operations) the injected `projectName`/`reportGroupArn` is
 * boilerplate.
 *
 * CodeBuild authorizes builds, batch builds, sandboxes, and cache operations
 * against the *project* ARN, and report operations against the
 * *report-group* ARN — even when the request addresses a build/report id —
 * so every builder grants on the bound resource's ARN.
 */
/**
 * Build the impl Effect for an operation whose input carries a
 * `projectName` field: the runtime callable injects the bound
 * {@link Project}'s name and the deploy-time half grants `actions` on the
 * project ARN.
 */
export declare const makeCodeBuildProjectNameHttpBinding: <I extends {
    projectName?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CodeBuild.StartBuildBatch`. */
    tag: string;
    /** The distilled operation; `projectName` is injected from the project. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the project ARN. */
    actions: readonly string[];
}) => Effect.Effect<<P extends Project>(project: P) => Effect.Effect<(request?: Omit<I, "projectName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a project-anchored operation whose input
 * addresses builds/batches/sandboxes by id: the request passes through
 * as-is and the deploy-time half grants `actions` on the project ARN
 * (CodeBuild authorizes build-/batch-addressed operations against the
 * project the id belongs to). Sandbox-addressed actions authorize against
 * the *sandbox* ARN (`…:sandbox/{project-name}:{uuid}`) — set
 * `sandboxScoped` to additionally grant on the project's sandbox pattern.
 */
export declare const makeCodeBuildProjectHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CodeBuild.StopBuild`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the project ARN. */
    actions: readonly string[];
    /** Also grant on `…:sandbox/{project-name}:*` (sandbox-addressed actions). */
    sandboxScoped?: boolean;
}) => Effect.Effect<<P extends Project>(project: P) => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an operation whose input carries a
 * `reportGroupArn` field: the runtime callable injects the bound
 * {@link ReportGroup}'s ARN and the deploy-time half grants `actions` on
 * the report-group ARN.
 */
export declare const makeCodeBuildReportGroupArnHttpBinding: <I extends {
    reportGroupArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CodeBuild.GetReportGroupTrend`. */
    tag: string;
    /** The distilled operation; `reportGroupArn` is injected from the group. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the report-group ARN. */
    actions: readonly string[];
}) => Effect.Effect<<G extends ReportGroup>(reportGroup: G) => Effect.Effect<(request?: Omit<I, "reportGroupArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a report-group-anchored operation whose input
 * addresses reports by ARN: the request passes through as-is and the
 * deploy-time half grants `actions` on the report-group ARN (CodeBuild
 * authorizes report operations against the report group the report belongs
 * to).
 */
export declare const makeCodeBuildReportGroupHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CodeBuild.DescribeTestCases`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the report-group ARN. */
    actions: readonly string[];
}) => Effect.Effect<<G extends ReportGroup>(reportGroup: G) => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map