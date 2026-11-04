import * as TSQ from "@distilled.cloud/aws/timestream-query";
import * as TSW from "@distilled.cloud/aws/timestream-write";
import * as Effect from "effect/Effect";
import type { Table } from "./Table.ts";
/**
 * Build the impl Effect for a table-scoped `timestream-write` operation. The
 * deploy-time half grants `actions` on the bound {@link Table}'s ARN (plus
 * its owning database's ARN when `grantDatabaseArn` is set — batch load
 * authorizes against both); the runtime callable shapes the caller's request
 * via `toRequest`, injecting the table's physical names.
 */
export declare const makeWriteTableHttpBinding: <Req, I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Timestream.WriteRecords`. */
    tag: string;
    /** The distilled `timestream-write` operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the table ARN. */
    actions: readonly string[];
    /** Also grant `actions` on the owning database's ARN (batch load). */
    grantDatabaseArn?: boolean;
    /** Shape the wire request from the caller's request + the table names. */
    toRequest: (request: Req, names: {
        DatabaseName: string;
        TableName: string;
    }) => I;
}) => Effect.Effect<(table: Table) => Effect.Effect<(request: Req) => Effect.Effect<A, E | TSW.DescribeEndpointsError, never>, never, never>, never, R | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Build the impl Effect for a table-scoped `timestream-query` operation
 * (`Query`, `PrepareQuery`). Timestream authorizes query actions against the
 * tables the SQL references, so the deploy-time half grants `actions` on the
 * bound {@link Table}'s ARN; the request passes through as-is (the SQL
 * references the database and table by name).
 */
export declare const makeQueryTableHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Timestream.Query`. */
    tag: string;
    /** The distilled `timestream-query` operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the table ARN. */
    actions: readonly string[];
}) => Effect.Effect<(table: Table) => Effect.Effect<(request: I) => Effect.Effect<A, E | TSQ.DescribeEndpointsError, never>, never, never>, never, R | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Build the impl Effect for an account-level `timestream-write` operation
 * (batch-load task reads/resume — authorized against `*`, keyed by TaskId in
 * the request). Invoked with no resource argument; the request passes
 * through as-is.
 */
export declare const makeWriteAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Timestream.DescribeBatchLoadTask`. */
    tag: string;
    /** The distilled `timestream-write` operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request: I) => Effect.Effect<A, E | TSW.DescribeEndpointsError, never>, never, never>, never, R | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Build the impl Effect for an account-level `timestream-query` operation
 * (`CancelQuery` — authorized against `*`, keyed by QueryId in the request).
 * Invoked with no resource argument; the request passes through as-is.
 */
export declare const makeQueryAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Timestream.CancelQuery`. */
    tag: string;
    /** The distilled `timestream-query` operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request: I) => Effect.Effect<A, E | TSQ.DescribeEndpointsError, never>, never, never>, never, R | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=BindingHttp.d.ts.map