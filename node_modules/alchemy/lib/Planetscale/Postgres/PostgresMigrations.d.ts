import * as ps from "@distilled.cloud/planetscale";
import * as Effect from "effect/Effect";
import { type NormalizedMigrationsInput, type StampedMigrationsState } from "../../SQL/Migrations/index.ts";
declare const PostgresMigrationError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Planetscale::PostgresMigrationError";
} & Readonly<A>;
export declare class PostgresMigrationError extends PostgresMigrationError_base<{
    message: string;
    cause?: unknown;
}> {
}
export interface PostgresMigrationTarget {
    organization: string;
    database: string;
    branch: string;
}
/**
 * PlanetScale Postgres's migration adaptation is exactly this: the shared
 * pipeline with a temp-role-scoped pg client as its executor.
 */
export declare const runPostgresMigrations: (target: PostgresMigrationTarget, input: NormalizedMigrationsInput, stamped: StampedMigrationsState) => Effect.Effect<import("../../SQL/Migrations/Registry.ts").MigrationRun, import("../../SQL/Migrations/Format.ts").DrizzleV0LayoutError | import("../../SQL/Migrations/Format.ts").MigrationError | import("../../SQL/Migrations/Format.ts").MigrationHistoryConflictError | PostgresMigrationError | ps.CreateRoleError, import("effect/FileSystem").FileSystem | import("effect/Path").Path | ps.PlanetScaleOpContext>;
export declare const runPostgresImports: (target: PostgresMigrationTarget, importFiles: ReadonlyArray<string>, rootDir: string, previous: Record<string, string>) => Effect.Effect<Record<string, string>, import("effect/PlatformError").PlatformError | PostgresMigrationError | ps.CreateRoleError, import("effect/FileSystem").FileSystem | import("effect/Path").Path | ps.PlanetScaleOpContext>;
export {};
//# sourceMappingURL=PostgresMigrations.d.ts.map