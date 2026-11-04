import * as Redacted from "effect/Redacted";
/**
 * Environment variable prefix under which a `Connect` binding publishes a
 * resource's endpoint on the host Function, derived from the service name
 * and the resource's logical ID. A MemoryDB cluster with logical ID
 * `SessionStore` yields `MEMORYDB_SESSIONSTORE` and variables like
 * `MEMORYDB_SESSIONSTORE_HOST` / `MEMORYDB_SESSIONSTORE_PORT`.
 */
export const connectEnvPrefix = (service, logicalId) => `${sanitizeEnvSegment(service)}_${sanitizeEnvSegment(logicalId)}`;
const sanitizeEnvSegment = (segment) => segment.replace(/[^A-Za-z0-9]+/g, "_").toUpperCase();
/**
 * Format an RFC-3986 SQL connection URL
 * (`scheme://user:pass@host:port/database?sslmode=require`). Username and
 * password are percent-encoded; the result is `Redacted` because it embeds
 * the password.
 */
export const formatSqlConnectionUrl = (options) => {
    const scheme = options.scheme ?? "postgresql";
    const password = options.password === undefined
        ? undefined
        : typeof options.password === "string"
            ? options.password
            : Redacted.value(options.password);
    const auth = options.username !== undefined
        ? password !== undefined
            ? `${encodeURIComponent(options.username)}:${encodeURIComponent(password)}@`
            : `${encodeURIComponent(options.username)}@`
        : "";
    const port = options.port !== undefined ? `:${options.port}` : "";
    const database = options.database !== undefined
        ? `/${encodeURIComponent(options.database)}`
        : "";
    const query = new URLSearchParams(options.params);
    if (options.ssl === true) {
        query.set("sslmode", options.sslMode ?? "require");
    }
    const queryString = query.size > 0 ? `?${query.toString()}` : "";
    return Redacted.make(`${scheme}://${auth}${options.host}${port}${database}${queryString}`);
};
//# sourceMappingURL=internal.js.map