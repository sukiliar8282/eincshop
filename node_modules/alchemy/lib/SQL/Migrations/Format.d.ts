import type * as Effect from "effect/Effect";
export type MigrationDialect = "postgres" | "mysql" | "sqlite";
/**
 * A single migration read from disk, normalized across directory layouts.
 */
export interface MigrationRecord {
    /**
     * The bookkeeping key used for applied-detection. Layout-dependent: the
     * directory name for drizzle-kit/Prisma-layout dirs
     * (`20260721033159_init`), the relative file path for flat dirs
     * (`0001_users.sql`).
     */
    name: string;
    /** sha256 hex of the raw file content. */
    hash: string;
    /**
     * Millis derived from a 14-digit `YYYYMMDDHHMMSS` prefix when present.
     */
    createdAtMillis: number | undefined;
    /** Raw file content. */
    sql: string;
    /** Individual statements (split on `--> statement-breakpoint`). */
    statements: string[];
}
/**
 * The minimal query surface the migration flow needs from its target
 * database. Each database resource adapts its native access path (the D1
 * HTTP API, a `pg.Client` over a Planetscale temp role, a `mysql2`
 * connection, the local workerd D1 tunnel) into this shape once.
 */
export interface SqlExecutor {
    readonly dialect: MigrationDialect;
    /**
     * Run a single query and return its rows as objects. `params` bind as
     * `?`/`$n` placeholders; adapters without native parameter support inline
     * them as SQL literals (see `inlineSqlParams`).
     */
    readonly query: (sql: string, params?: ReadonlyArray<unknown>) => Effect.Effect<Array<Record<string, unknown>>, MigrationError>;
    /**
     * Execute one or more statements as a unit — a transaction where the
     * target supports one (pg/mysql), a single batched query on D1 (which has
     * no transactions over HTTP).
     */
    readonly batch: (statements: ReadonlyArray<string>) => Effect.Effect<void, MigrationError>;
}
declare const MigrationError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MigrationError";
} & Readonly<A>;
/** A migration failed to read, convert, or apply. */
export declare class MigrationError extends MigrationError_base<{
    message: string;
    cause?: unknown;
}> {
}
declare const DrizzleV0LayoutError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DrizzleV0LayoutError";
} & Readonly<A>;
/**
 * The migrations directory uses drizzle-kit's pre-v1 layout
 * (`meta/_journal.json`). The fix is upstream: `drizzle-kit up`.
 */
export declare class DrizzleV0LayoutError extends DrizzleV0LayoutError_base<{
    dir: string;
    message: string;
}> {
}
declare const MigrationHistoryConflictError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MigrationHistoryConflictError";
} & Readonly<A>;
/**
 * A row recorded in an applied-migrations table (ours, or a foreign one
 * being converted) matches no local migration file. Guessing would corrupt
 * history, so this is a hard error — migrations were applied to the
 * database that the local environment does not have.
 */
export declare class MigrationHistoryConflictError extends MigrationHistoryConflictError_base<{
    table: string;
    unmatched: ReadonlyArray<string>;
    message: string;
}> {
}
export type MigrationApplyError = MigrationError | MigrationHistoryConflictError;
export {};
//# sourceMappingURL=Format.d.ts.map