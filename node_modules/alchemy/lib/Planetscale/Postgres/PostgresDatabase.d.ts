import * as planetscale from "@distilled.cloud/planetscale";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { BaseDatabaseAttributes, BaseDatabaseProps } from "../Database.ts";
import type { Providers } from "../Providers.ts";
import { type PostgresClusterSize } from "./PostgresClusterSize.ts";
/**
 * Properties for creating or updating a PostgreSQL PlanetScale database.
 */
export interface PostgresDatabaseProps extends BaseDatabaseProps {
    /**
     * The PostgreSQL database cluster size. Required.
     *
     * Short NAS sizes (`"PS_10"`) are expanded using the target region and
     * architecture. [PlanetScale Metal](https://planetscale.com/docs/metal)
     * requires the full SKU (e.g. `"M1_10_AWS_ARM_D_METAL_10"`) because
     * Metal also encodes CPU series, architecture, and NVMe drive size.
     *
     * @see https://planetscale.com/docs/postgres/pricing
     * @see {@link PostgresClusterSize}
     */
    clusterSize: PostgresClusterSize;
    /**
     * PostgreSQL major version. Defaults to the latest available major
     * version.
     */
    majorVersion?: string;
    /**
     * CPU architecture. Cannot be changed after creation.
     * @default "x86"
     */
    arch?: "x86" | "arm";
}
/**
 * Output attributes of a deployed PostgreSQL PlanetScale database.
 */
export interface PostgresDatabaseAttributes extends BaseDatabaseAttributes {
    /** PostgreSQL CPU architecture. */
    arch: "x86" | "arm";
}
/**
 * A PostgreSQL PlanetScale database. For MySQL, use {@link MySQLDatabase}
 * instead.
 *
 * ### Creating a PostgreSQL Database
 * **Example:** Basic PostgreSQL database
 * ```typescript
 * const db = yield* Planetscale.PostgresDatabase("MyDb", {
 *   clusterSize: "PS_10",
 * });
 * ```
 *
 * **Example:** PlanetScale Metal (NVMe)
 * ```typescript
 * const db = yield* Planetscale.PostgresDatabase("MyDb", {
 *   clusterSize: "M1_10_AWS_ARM_D_METAL_10",
 *   arch: "arm",
 * });
 * ```
 *
 * ### Migrations and seed data
 * **Example:** Apply migrations and seed files
 * ```typescript
 * const db = yield* Planetscale.PostgresDatabase("MyDb", {
 *   clusterSize: "PS_10",
 *   migrationsDir: "./migrations/postgres",
 *   importFiles: ["./seed/postgres.sql"],
 * });
 * ```
 *
 * ### Adoption
 * **Example:** Adopting an existing database
 * ```typescript
 * import { adopt } from "alchemy/AdoptPolicy";
 *
 * const db = yield* Planetscale.PostgresDatabase("Existing", {
 *   name: "existing-db",
 *   clusterSize: "PS_10",
 * }).pipe(adopt());
 * ```
 */
export type PostgresDatabase = Resource<"Planetscale.PostgresDatabase", PostgresDatabaseProps, PostgresDatabaseAttributes, never, Providers>;
/** @resource */
export declare const PostgresDatabase: import("../../Resource.ts").ResourceClass<PostgresDatabase>;
export declare const PostgresDatabaseProvider: () => import("effect/Layer").Layer<Provider.Provider<PostgresDatabase>, never, import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | planetscale.PlanetScaleOpContext>;
//# sourceMappingURL=PostgresDatabase.d.ts.map