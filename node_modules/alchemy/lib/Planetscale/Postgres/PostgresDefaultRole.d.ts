import * as planetscale from "@distilled.cloud/planetscale";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { PostgresBranch } from "./PostgresBranch.ts";
import type { PostgresDatabase } from "./PostgresDatabase.ts";
import type { InheritedRole } from "./PostgresRole.ts";
/**
 * Properties for creating or updating the default PlanetScale PostgreSQL
 * role for a branch.
 *
 * Default roles are only meant for PostgreSQL databases. For MySQL,
 * use {@link MySQLPassword} instead.
 */
export interface PostgresDefaultRoleProps {
    /**
     * PostgreSQL database — string name or {@link PostgresDatabase} resource.
     */
    database: string | PostgresDatabase;
    /**
     * Branch — string name or {@link PostgresBranch} resource.
     * @default "main"
     */
    branch?: string | PostgresBranch;
    /**
     * Whether to force-reset the default role if it already exists.
     * Adopting an existing default role is not supported because the
     * password is only returned at create time.
     * @default false
     */
    forceReset?: boolean;
}
/**
 * Output attributes of a deployed PlanetScale default role.
 */
export interface PostgresDefaultRoleAttributes {
    /** Unique identifier for the role (stable). */
    id: string;
    /** The Postgres role name. */
    name: string;
    /** ISO 8601 timestamp at which the role expires. */
    expiresAt: string | null;
    /** Hostname for the database connection. */
    host: string;
    /** Username for database authentication. */
    username: string;
    /** Password for database authentication (Redacted). */
    password: Redacted.Redacted<string>;
    /** TTL in seconds (if set). */
    ttl: number | null;
    /** The database name. */
    databaseName: string;
    /** Direct connection URL for the database (Redacted). */
    connectionUrl: Redacted.Redacted<string>;
    /** Pooled connection URL via PSBouncer (Redacted). */
    connectionUrlPooled: Redacted.Redacted<string>;
    /**
     * Private connection host or DNS zone for this branch, supplied by
     * PlanetScale. GCP Private Service Connect requires an endpoint name before
     * this DNS zone.
     */
    privateHost: string;
    /** Service name for this branch supplied by PlanetScale to establish a private connection. */
    privateConnectionServiceName: string;
    /** Inherited roles. */
    inheritedRoles: InheritedRole[];
    /** Resolved organization slug. */
    organization: string;
    /** Resolved database name (for delete). */
    database: string;
    /** Resolved branch name. */
    branch: string;
}
/**
 * The default PlanetScale PostgreSQL role for a database branch.
 *
 * ### Creating a Default Role
 * **Example:** Default role on the main branch
 * ```typescript
 * const db = yield* Planetscale.PostgresDatabase("MyDb", {
 *   clusterSize: "PS_10",
 * });
 * const defaultRole = yield* Planetscale.PostgresDefaultRole("MainRole", {
 *   database: db,
 *   forceReset: true,
 * });
 * ```
 */
export type PostgresDefaultRole = Resource<"Planetscale.PostgresDefaultRole", PostgresDefaultRoleProps, PostgresDefaultRoleAttributes, never, Providers>;
/** @resource */
export declare const PostgresDefaultRole: import("../../Resource.ts").ResourceClass<PostgresDefaultRole>;
export declare const PostgresDefaultRoleProvider: () => import("effect/Layer").Layer<Provider.Provider<PostgresDefaultRole>, never, planetscale.PlanetScaleOpContext>;
//# sourceMappingURL=PostgresDefaultRole.d.ts.map