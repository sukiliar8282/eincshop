import type * as rdsdata from "@distilled.cloud/aws/rds-data";
/**
 * JS value → Data API `SqlParameter` marshalling, matching the Postgres
 * wire expectations: integers as `longValue`, floats as `doubleValue`,
 * `Date`s as `TIMESTAMP`-hinted strings, `Uint8Array` as blobs, and
 * anything else JSON-stringified.
 */
export declare const toSqlParameter: (name: string, value: unknown) => rdsdata.SqlParameter;
/**
 * Data API `Field` → JS value. Timestamp-typed columns (per the response's
 * `columnMetadata.typeName`) revive as `Date`s — the Data API returns UTC
 * timestamps as `"YYYY-MM-DD HH:MM:SS[.FFF]"` strings.
 */
export declare const fromField: (field: rdsdata.Field, typeName: string | undefined) => unknown;
/**
 * Map an `executeStatement` response (with `includeResultMetadata: true`)
 * to rows keyed by column label.
 */
export declare const toRows: (response: {
    records?: rdsdata.Field[][];
    columnMetadata?: rdsdata.ColumnMetadata[];
}) => Record<string, unknown>[];
//# sourceMappingURL=Marshall.d.ts.map