import * as planetscale from "@distilled.cloud/planetscale";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { MySQLBranch } from "./MySQLBranch.ts";
import type { MySQLDatabase } from "./MySQLDatabase.ts";
import type { MySQLOrigin } from "./MySQLOrigin.ts";
/**
 * Properties for creating or updating a PlanetScale MySQL password.
 *
 * Passwords are only meant for MySQL databases. For PostgreSQL,
 * use {@link PostgresRole} instead.
 */
export interface MySQLPasswordProps {
    /**
     * Password name. If omitted, a unique name is generated from
     * `${app}-${stage}-${id}`.
     */
    name?: string;
    /**
     * MySQL database — string name or {@link MySQLDatabase} resource.
     */
    database: string | MySQLDatabase;
    /**
     * Branch — string name or {@link MySQLBranch} resource.
     * @default "main"
     */
    branch?: string | MySQLBranch;
    /**
     * The MySQL role granted to the password.
     */
    role: "reader" | "writer" | "admin" | "readwriter";
    /**
     * Whether the password is for a read replica.
     */
    replica?: boolean;
    /**
     * Time to live (seconds). The password is invalidated after this period.
     */
    ttl?: number;
    /**
     * IP CIDR ranges allowed to use this password.
     */
    cidrs?: string[];
}
/**
 * Output attributes of a deployed PlanetScale password.
 */
export interface MySQLPasswordAttributes {
    /** Unique identifier for the password (stable). */
    id: string;
    /** Password name. If omitted, a unique name is generated from `${app}-${stage}-${id}`. */
    name: string;
    /** ISO 8601 timestamp at which the password expires. `null` if no TTL. */
    expiresAt: string | null;
    /** Hostname for the database connection. */
    host: string;
    /** Username for database authentication. */
    username: string;
    /** Password for database authentication (Redacted). */
    password: Redacted.Redacted<string>;
    /** Parsed connection components ready to feed into Cloudflare Hyperdrive. */
    origin: MySQLOrigin;
    /** Resolved organization slug. */
    organization: string;
    /** Resolved database name. */
    database: string;
    /** Resolved branch name. */
    branch: string;
    /** The role granted. */
    role: "reader" | "writer" | "admin" | "readwriter" | (string & {});
    /** Whether this password is for a read replica. */
    replica: boolean | undefined;
    /** TTL in seconds (if set). */
    ttl: number | undefined;
    /** IP CIDR ranges allowed to use this password. */
    cidrs: readonly string[] | undefined;
}
/**
 * A PlanetScale password for accessing a MySQL database branch.
 *
 * For PostgreSQL databases, use {@link PostgresRole} instead.
 *
 * ### Creating a Password
 * **Example:** Reader password
 * ```typescript
 * const reader = yield* Planetscale.MySQLPassword("AppReader", {
 *   database: "my-db",
 *   role: "reader",
 * });
 * ```
 *
 * **Example:** Writer password with TTL
 * ```typescript
 * const writer = yield* Planetscale.MySQLPassword("AppWriter", {
 *   database: "my-db",
 *   role: "writer",
 *   ttl: 86400,
 * });
 * ```
 *
 * **Example:** Admin password with IP allowlist
 * ```typescript
 * const admin = yield* Planetscale.MySQLPassword("Admin", {
 *   database: "my-db",
 *   role: "admin",
 *   cidrs: ["203.0.113.0/24", "198.51.100.0/24"],
 * });
 * ```
 */
export type MySQLPassword = Resource<"Planetscale.MySQLPassword", MySQLPasswordProps, MySQLPasswordAttributes, never, Providers>;
/** @resource */
export declare const MySQLPassword: import("../../Resource.ts").ResourceClass<MySQLPassword>;
export declare const MySQLPasswordProvider: () => import("effect/Layer").Layer<Provider.Provider<MySQLPassword>, never, import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | planetscale.PlanetScaleOpContext>;
//# sourceMappingURL=MySQLPassword.d.ts.map