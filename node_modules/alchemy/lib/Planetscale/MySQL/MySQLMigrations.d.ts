import * as ps from "@distilled.cloud/planetscale";
import * as Effect from "effect/Effect";
import { type NormalizedMigrationsInput, type StampedMigrationsState } from "../../SQL/Migrations/index.ts";
declare const MySQLMigrationError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Planetscale::MySQLMigrationError";
} & Readonly<A>;
export declare class MySQLMigrationError extends MySQLMigrationError_base<{
    message: string;
    cause?: unknown;
}> {
}
export interface MySQLMigrationTarget {
    organization: string;
    database: string;
    branch: string;
}
/**
 * PlanetScale MySQL's migration adaptation is exactly this: the shared
 * pipeline with a temp-password-scoped mysql2 connection as its executor.
 */
export declare const runMySQLMigrations: (target: MySQLMigrationTarget, input: NormalizedMigrationsInput, stamped: StampedMigrationsState) => Effect.Effect<import("../../SQL/Migrations/Registry.ts").MigrationRun, import("../../SQL/Migrations/Format.ts").DrizzleV0LayoutError | import("../../SQL/Migrations/Format.ts").MigrationError | import("../../SQL/Migrations/Format.ts").MigrationHistoryConflictError | MySQLMigrationError | ps.CreatePasswordError, import("effect/FileSystem").FileSystem | import("effect/Path").Path | ps.PlanetScaleOpContext>;
export declare const runMySQLImports: (target: MySQLMigrationTarget, importFiles: ReadonlyArray<string>, rootDir: string, previous: Record<string, string>) => Effect.Effect<Record<string, string>, MySQLMigrationError | import("effect/PlatformError").PlatformError | ps.CreatePasswordError, import("effect/FileSystem").FileSystem | import("effect/Path").Path | ps.PlanetScaleOpContext>;
export {};
//# sourceMappingURL=MySQLMigrations.d.ts.map