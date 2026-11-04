import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type { Client } from "pg";
import { type NormalizedMigrationsInput, type StampedMigrationsState } from "../SQL/Migrations/index.ts";
declare const PgError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "PgError";
} & Readonly<A>;
export declare class PgError extends PgError_base<{
    message: string;
    cause?: unknown;
}> {
}
/** Open a pg client for the scope of `use`, closing it afterwards. */
export declare const withPgClient: <A, E, R>(connectionUri: Redacted.Redacted<string>, use: (client: Client) => Effect.Effect<A, E, R>) => Effect.Effect<A, PgError | E, R>;
/**
 * Neon's migration adaptation is exactly this: the shared pipeline with a
 * connection-URI-scoped pg client as its executor.
 */
export declare const runPgMigrations: (options: {
    connectionUri: Redacted.Redacted<string>;
    input: NormalizedMigrationsInput;
    stamped: StampedMigrationsState;
}) => Effect.Effect<import("../SQL/Migrations/Registry.ts").MigrationRun, import("../SQL/Migrations/Format.ts").DrizzleV0LayoutError | import("../SQL/Migrations/Format.ts").MigrationError | import("../SQL/Migrations/Format.ts").MigrationHistoryConflictError | PgError, import("effect/FileSystem").FileSystem | import("effect/Path").Path>;
/**
 * Run a single SQL script against the database (used for `importFiles`).
 */
export declare const runSql: (connectionUri: Redacted.Redacted<string>, sql: string) => Effect.Effect<void, PgError, never>;
export {};
//# sourceMappingURL=Migrations.d.ts.map