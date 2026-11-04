import * as planetscale from "@distilled.cloud/planetscale";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { PostgresBranch } from "./PostgresBranch.ts";
import type { PostgresDatabase } from "./PostgresDatabase.ts";
import type { PostgresOrigin } from "./PostgresOrigin.ts";
/**
 * Built-in PostgreSQL roles that can be inherited from. Custom role names
 * (referencing other Role resources) are also accepted.
 */
export type InheritedRole = "pscale_managed" | "pg_checkpoint" | "pg_create_subscription" | "pg_maintain" | "pg_monitor" | "pg_read_all_data" | "pg_read_all_settings" | "pg_read_all_stats" | "pg_signal_backend" | "pg_stat_scan_tables" | "pg_use_reserved_connections" | "pg_write_all_data" | "postgres" | (string & {});
/**
 * Properties for creating or updating a PlanetScale PostgreSQL role.
 *
 * Roles are only meant for PostgreSQL databases. For MySQL,
 * use {@link MySQLPassword} instead.
 */
export interface PostgresRoleProps {
    /**
     * Role name. If not provided, a physical name will be generated.
     */
    name?: string;
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
     * Time to live in seconds.
     */
    ttl?: number;
    /**
     * Roles to inherit from. Either a list of built-in role names, or
     * another {@link PostgresRole} resource (whose `inheritedRoles` are reused).
     */
    inheritedRoles: InheritedRole[] | PostgresRole;
    /**
     * Successor role to reassign ownership to before dropping. Used during
     * delete.
     * @default "postgres"
     */
    successor?: string | PostgresRole;
}
/**
 * Output attributes of a deployed PlanetScale role.
 */
export interface PostgresRoleAttributes {
    /** Unique identifier for the role (stable). */
    id: string;
    /** The Postgres role name (assigned by PlanetScale). */
    name: string;
    /** ISO 8601 timestamp at which the role expires. */
    expiresAt: string | null;
    /** Hostname for the database connection. */
    host: string;
    /** Username for database authentication. */
    username: string;
    /** Password for database authentication (Redacted). */
    password: Redacted.Redacted<string>;
    /** The database name. */
    database: string;
    /** The Postgres database name inside the branch. */
    databaseName: string;
    /** Parsed direct (port 5432) connection components ready to feed into Cloudflare Hyperdrive. */
    origin: PostgresOrigin;
    /** Parsed pooled (PSBouncer, port 6432) connection components, e.g. for a Hyperdrive `dev` origin. */
    pooledOrigin: PostgresOrigin;
    /**
     * Private connection host or DNS zone for this branch, supplied by
     * PlanetScale. GCP Private Service Connect requires an endpoint name before
     * this DNS zone.
     */
    privateHost: string;
    /** Service name for this branch supplied by PlanetScale to establish a private connection. */
    privateConnectionServiceName: string;
    /** Direct connection URL for the database (Redacted). */
    connectionUrl: Redacted.Redacted<string>;
    /** Pooled connection URL via PSBouncer (port 6432, Redacted). */
    connectionUrlPooled: Redacted.Redacted<string>;
    /** Inherited roles. */
    inheritedRoles: InheritedRole[];
    /** The successor role used during delete. */
    successor: string;
    /** Resolved organization slug. */
    organization: string;
    /** Resolved branch name. */
    branch: string;
    /** Time-to-live for the role in seconds. */
    ttl: number | null;
}
/**
 * A PlanetScale role for accessing a PostgreSQL database branch.
 *
 * For MySQL databases, use {@link MySQLPassword} instead.
 *
 * ### Creating a Role
 * **Example:** Postgres admin role
 * ```typescript
 * const admin = yield* Planetscale.PostgresRole("Admin", {
 *   database: "my-db",
 *   inheritedRoles: ["postgres"],
 * });
 * ```
 *
 * **Example:** Read-only role
 * ```typescript
 * const reader = yield* Planetscale.PostgresRole("Reader", {
 *   database: "my-db",
 *   inheritedRoles: ["pg_read_all_data", "pg_read_all_settings"],
 * });
 * ```
 *
 * **Example:** Role with TTL
 * ```typescript
 * const tempReader = yield* Planetscale.PostgresRole("TempReader", {
 *   database: "my-db",
 *   inheritedRoles: ["pg_read_all_data"],
 *   ttl: 3600,
 * });
 * ```
 */
export type PostgresRole = Resource<"Planetscale.PostgresRole", PostgresRoleProps, PostgresRoleAttributes, never, Providers>;
/** @resource */
export declare const PostgresRole: import("../../Resource.ts").ResourceClass<PostgresRole>;
export declare const PostgresRoleProvider: () => import("effect/Layer").Layer<Provider.Provider<PostgresRole>, never, import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | planetscale.PlanetScaleOpContext>;
//# sourceMappingURL=PostgresRole.d.ts.map