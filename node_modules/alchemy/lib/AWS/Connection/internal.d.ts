import * as Redacted from "effect/Redacted";
/**
 * Connection descriptor shared by every SQL-wire `Connect` binding
 * (RDS/Aurora, DSQL, Redshift, ...). The `url` field is the RFC-3986
 * connection URL — it feeds `Drizzle.Postgres` / a Hyperdrive origin
 * directly, so consumers need zero per-engine glue.
 */
export interface SqlConnectionInfo {
    /** Endpoint hostname. */
    host: string;
    /** Endpoint port. */
    port: number;
    /** Database name, when one was requested. */
    database?: string;
    /** Login user, when the credential strategy resolves one. */
    username?: string;
    /**
     * Login password (or short-lived IAM auth token), when the credential
     * strategy resolves one.
     */
    password?: Redacted.Redacted<string>;
    /** Whether the connection requires TLS. */
    ssl: boolean;
    /**
     * RFC-3986 connection URL — feeds `Drizzle.Postgres` / Hyperdrive
     * origin directly.
     */
    url: Redacted.Redacted<string>;
}
/**
 * Environment variable prefix under which a `Connect` binding publishes a
 * resource's endpoint on the host Function, derived from the service name
 * and the resource's logical ID. A MemoryDB cluster with logical ID
 * `SessionStore` yields `MEMORYDB_SESSIONSTORE` and variables like
 * `MEMORYDB_SESSIONSTORE_HOST` / `MEMORYDB_SESSIONSTORE_PORT`.
 */
export declare const connectEnvPrefix: (service: string, logicalId: string) => string;
export interface SqlConnectionUrlOptions {
    /**
     * URL scheme.
     * @default "postgresql"
     */
    scheme?: string;
    host: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string | Redacted.Redacted<string>;
    /**
     * When `true`, appends `sslmode={sslMode}` to the URL query (the
     * postgres-flavored TLS opt-in that both `postgres.js` and Hyperdrive
     * origins understand).
     */
    ssl?: boolean;
    /**
     * `sslmode` value appended when {@link SqlConnectionUrlOptions.ssl} is
     * `true`. `node-pg`'s URL parser treats `require` as full-verification
     * TLS against Node's trust store — endpoints whose certificates chain to
     * a private CA (RDS/Aurora) must use `no-verify` (TLS on, identity
     * verification off — libpq `require` semantics) unless the CA bundle is
     * provided out-of-band.
     * @default "require"
     */
    sslMode?: "require" | "no-verify";
    /** Extra query parameters to append verbatim. */
    params?: Record<string, string>;
}
/**
 * Format an RFC-3986 SQL connection URL
 * (`scheme://user:pass@host:port/database?sslmode=require`). Username and
 * password are percent-encoded; the result is `Redacted` because it embeds
 * the password.
 */
export declare const formatSqlConnectionUrl: (options: SqlConnectionUrlOptions) => Redacted.Redacted<string>;
//# sourceMappingURL=internal.d.ts.map