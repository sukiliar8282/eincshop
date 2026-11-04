import * as Effect from "effect/Effect";
import type { Table } from "./Table.ts";
import type { TableBucket } from "./TableBucket.ts";
/**
 * Shared scaffolding for the S3 Tables runtime bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeS3Tables…HttpBinding({ … }))` over one of the
 * two builders below. Everything except the operation, the IAM action list,
 * and the injected identifiers is boilerplate.
 */
/**
 * Build the impl Effect for a table-bucket-scoped S3 Tables operation: the
 * runtime callable injects the bound {@link TableBucket}'s ARN as
 * `tableBucketARN` and the deploy-time half grants `actions` on the bucket
 * ARN (and everything under it, for operations like `ListTables` whose IAM
 * resource is the namespace/table).
 */
export declare const makeS3TablesTableBucketHttpBinding: <I extends {
    tableBucketARN?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.S3Tables.ListNamespaces`. */
    tag: string;
    /** The distilled operation; `tableBucketARN` is injected from the bucket. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the bucket ARN and its children. */
    actions: readonly string[];
}) => Effect.Effect<(tableBucket: TableBucket) => Effect.Effect<(request?: Omit<I, "tableBucketARN"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a table-scoped S3 Tables operation: the runtime
 * callable injects the bound {@link Table}'s `tableBucketARN`, `namespace`,
 * and `name`, and the deploy-time half grants `actions` on the table's ARN.
 */
export declare const makeS3TablesTableHttpBinding: <I extends {
    tableBucketARN?: string;
    namespace?: string;
    name?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.S3Tables.GetTableMetadataLocation`. */
    tag: string;
    /**
     * The distilled operation; `tableBucketARN`, `namespace`, and `name` are
     * injected from the table.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the table ARN. */
    actions: readonly string[];
}) => Effect.Effect<(table: Table) => Effect.Effect<(request?: Omit<I, "name" | "namespace" | "tableBucketARN"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map