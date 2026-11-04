import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type { Client } from "pg";
import { type NormalizedMigrationsInput, type StampedMigrationsState } from "../SQL/Migrations/index.ts";
declare const PostgresMigrationError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.PostgresMigrationError";
} & Readonly<A>;
export declare class PostgresMigrationError extends PostgresMigrationError_base<{
    message: string;
    cause?: unknown;
}> {
}
/**
 * Strip query-string SSL flags so `pg-connection-string` does not treat
 * `sslmode=require` as `verify-full`. TLS and certificate verification
 * are set on the client (`ssl.rejectUnauthorized: true`).
 */
export declare const stripSslQueryParams: (uri: string) => string;
/** Open a pg client for the scope of `use`, closing it afterwards. */
export declare const withPgClient: <A, E, R>(connectionUri: Redacted.Redacted<string>, use: (client: Client) => Effect.Effect<A, E, R>) => Effect.Effect<A, PostgresMigrationError | E, R>;
/**
 * Fly Managed Postgres's migration adaptation is the shared pipeline
 * with a connection-URI-scoped pg client as its executor. Use the
 * direct (non-PgBouncer) URI so DDL and advisory locks work.
 */
export declare const runPgMigrations: (options: {
    connectionUri: Redacted.Redacted<string>;
    input: NormalizedMigrationsInput;
    stamped: StampedMigrationsState;
}) => Effect.Effect<import("../SQL/Migrations/Registry.ts").MigrationRun, import("../SQL/Migrations/Format.ts").DrizzleV0LayoutError | import("../SQL/Migrations/Format.ts").MigrationError | import("../SQL/Migrations/Format.ts").MigrationHistoryConflictError | PostgresMigrationError, import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
/** Run a single SQL script against the database (used for `importFiles`). */
export declare const runSql: (connectionUri: Redacted.Redacted<string>, sql: string) => Effect.Effect<void, PostgresMigrationError, never>;
export declare const runImports: (connectionUri: Redacted.Redacted<string>, importFiles: ReadonlyArray<string>, rootDir: string, previous: Record<string, string>) => Effect.Effect<Record<string, string>, import("effect/PlatformError").PlatformError | PostgresMigrationError, import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
export {};
//# sourceMappingURL=PostgresMigrations.d.ts.map