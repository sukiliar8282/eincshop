import * as planetscale from "@distilled.cloud/planetscale";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { BaseDatabaseAttributes, BaseDatabaseProps } from "../Database.ts";
import type { Providers } from "../Providers.ts";
import { type MySQLClusterSize } from "./MySQLClusterSize.ts";
/**
 * Properties for creating or updating a MySQL PlanetScale database.
 */
export interface MySQLDatabaseProps extends BaseDatabaseProps {
    /**
     * The MySQL database cluster size. Required.
     * @see https://planetscale.com/docs/concepts/cluster-size
     */
    clusterSize: MySQLClusterSize;
    /**
     * Desired total number of replicas for the database's default keyspace.
     * Each cluster size includes a fixed number of replicas (2 for
     * production `PS_*` sizes); higher values add extra replicas. Changes
     * are reconciled in place via PlanetScale's keyspace resize lifecycle —
     * never by replacing the database.
     * @see https://planetscale.com/docs/vitess/sharding/keyspaces
     */
    replicas?: number;
    /**
     * Whether to copy migration data to new branches and in deploy requests.
     */
    automaticMigrations?: boolean;
    /**
     * Migration framework to use on the database.
     */
    migrationFramework?: string;
    /**
     * Name of the migration table.
     */
    migrationTableName?: string;
    /**
     * Whether data branching is allowed on the database.
     */
    allowDataBranching?: boolean;
    /**
     * Whether foreign key constraints are allowed on the database.
     */
    allowForeignKeyConstraints?: boolean;
    /**
     * Whether full queries should be collected from the database.
     */
    insightsRawQueries?: boolean;
}
/**
 * Output attributes of a deployed MySQL PlanetScale database.
 */
export interface MySQLDatabaseAttributes extends BaseDatabaseAttributes {
    /**
     * Observed total replica count of the default keyspace on the default
     * branch, or `undefined` while the keyspace is still provisioning.
     */
    replicas: number | undefined;
    /**
     * Whether to copy migration data to new branches and in deploy requests.
     */
    automaticMigrations: boolean;
    /**
     * Migration framework to use on the database.
     */
    migrationFramework?: string;
    /**
     * Name of the migration table.
     */
    migrationTableName?: string;
    /**
     * Whether data branching is allowed on the database.
     */
    allowDataBranching: boolean;
    /**
     * Whether foreign key constraints are allowed on the database.
     */
    allowForeignKeyConstraints: boolean;
    /**
     * Whether full queries should be collected from the database.
     */
    insightsRawQueries: boolean;
}
/**
 * A MySQL PlanetScale database (powered by Vitess). For PostgreSQL use
 * {@link PostgresDatabase} instead.
 *
 * ### Creating a MySQL Database
 * **Example:** Basic MySQL database
 * ```typescript
 * const db = yield* Planetscale.MySQLDatabase("MyDb", {
 *   clusterSize: "PS_10",
 * });
 * ```
 *
 * **Example:** MySQL with Vitess migration tooling
 * ```typescript
 * const db = yield* Planetscale.MySQLDatabase("MyDb", {
 *   clusterSize: "PS_10",
 *   automaticMigrations: true,
 *   migrationFramework: "rails",
 *   migrationTableName: "schema_migrations",
 *   allowDataBranching: true,
 * });
 * ```
 *
 * ### Migrations and seed data
 * **Example:** Apply migrations and seed files
 * ```typescript
 * const db = yield* Planetscale.MySQLDatabase("MyDb", {
 *   clusterSize: "PS_10",
 *   migrationsDir: "./migrations/mysql",
 *   importFiles: ["./seed/mysql.sql"],
 * });
 * ```
 *
 * ### Adoption
 * **Example:** Adopting an existing database
 * ```typescript
 * import { adopt } from "alchemy/AdoptPolicy";
 *
 * const db = yield* Planetscale.MySQLDatabase("Existing", {
 *   name: "existing-db",
 *   clusterSize: "PS_10",
 * }).pipe(adopt());
 * ```
 */
export type MySQLDatabase = Resource<"Planetscale.MySQLDatabase", MySQLDatabaseProps, MySQLDatabaseAttributes, never, Providers>;
/** @resource */
export declare const MySQLDatabase: import("../../Resource.ts").ResourceClass<MySQLDatabase>;
export declare const MySQLDatabaseProvider: () => import("effect/Layer").Layer<Provider.Provider<MySQLDatabase>, never, import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | planetscale.PlanetScaleOpContext>;
//# sourceMappingURL=MySQLDatabase.d.ts.map