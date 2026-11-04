import * as Effect from "effect/Effect";
import type { Crawler } from "./Crawler.ts";
import type { Database } from "./Database.ts";
import type { Job } from "./Job.ts";
import type { Table } from "./Table.ts";
/**
 * Shared scaffolding for AWS Glue HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the identifier injection, and the
 * IAM action list is boilerplate.
 *
 * Glue's catalog IAM model authorizes table- and partition-addressed actions
 * against the *catalog*, *database*, and *table* ARNs together, so the
 * database/table builders grant on all the ARNs the action evaluates.
 */
/**
 * Build the impl Effect for a Glue operation addressed to a {@link Job} by
 * `JobName`: the runtime callable injects the bound job's name and the
 * deploy-time half grants `actions` on the job ARN — or on `*` when
 * `anyResource` is set, for the handful of Glue actions that do not support
 * resource-level permissions (verified live: `glue:GetJobBookmark` /
 * `glue:ResetJobBookmark` are evaluated with no resource — an ARN-scoped
 * Allow never matches and IAM implicit-denies).
 */
export declare const makeGlueJobHttpBinding: <I extends {
    JobName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Glue.GetJobRun`. */
    tag: string;
    /** The distilled operation; `JobName` is injected from the job. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the job ARN. */
    actions: readonly string[];
    /**
     * Grant on `Resource: "*"` instead of the job ARN — required for actions
     * Glue evaluates without a resource (job bookmarks).
     */
    anyResource?: boolean;
}) => Effect.Effect<(job: Job) => Effect.Effect<(request?: Omit<I, "JobName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a Glue operation addressed to a {@link Crawler}
 * by `Name`: the runtime callable injects the bound crawler's name and the
 * deploy-time half grants `actions` on the crawler ARN.
 */
export declare const makeGlueCrawlerHttpBinding: <I extends {
    Name: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Glue.StartCrawler`. */
    tag: string;
    /** The distilled operation; `Name` is injected from the crawler. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the crawler ARN. */
    actions: readonly string[];
}) => Effect.Effect<(crawler: Crawler) => Effect.Effect<(request?: Omit<I, "Name"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a Glue Data Catalog operation addressed to a
 * {@link Database}: the runtime callable injects `DatabaseName` (+
 * `CatalogId`) and the deploy-time half grants `actions` on the catalog,
 * database, and contained-tables ARNs (Glue evaluates catalog actions
 * against all three).
 */
export declare const makeGlueDatabaseHttpBinding: <I extends {
    DatabaseName: string;
    CatalogId?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Glue.GetTables`. */
    tag: string;
    /** The distilled operation; `DatabaseName`/`CatalogId` are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the catalog + database + tables ARNs. */
    actions: readonly string[];
}) => Effect.Effect<(database: Database) => Effect.Effect<(request?: Omit<I, "CatalogId" | "DatabaseName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a Glue Data Catalog operation addressed to a
 * {@link Table}: the runtime callable injects `DatabaseName` + the table
 * name (+ `CatalogId`) and the deploy-time half grants `actions` on the
 * catalog, database, and table ARNs. Most table-addressed inputs carry the
 * table name as `TableName`; `GetTable` uses `Name` — pick with
 * `tableNameKey`.
 */
export declare const makeGlueTableHttpBinding: <K extends "TableName" | "Name", I extends {
    DatabaseName: string;
    CatalogId?: string;
} & { [key in K]: string; }, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Glue.GetPartitions`. */
    tag: string;
    /** The distilled operation; database/table identifiers are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the catalog + database + table ARNs. */
    actions: readonly string[];
    /** The request key carrying the table name. */
    tableNameKey: K;
}) => Effect.Effect<(table: Table) => Effect.Effect<(request?: Omit<I, "CatalogId" | "DatabaseName" | K> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map