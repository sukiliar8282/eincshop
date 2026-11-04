import * as Redacted from "effect/Redacted";
/**
 * Parse a Postgres connection URI into the structured origin shape. Used to
 * derive `connection.origin` / `connection.pooledOrigin` from the direct and
 * pooled connection strings Prisma returns.
 *
 * Returns `undefined` for non-Postgres URIs (e.g. `prisma://` Accelerate
 * connection strings) and malformed values.
 */
export const parsePostgresOrigin = (uri) => {
    let url;
    try {
        url = new URL(uri);
    }
    catch {
        return undefined;
    }
    if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
        return undefined;
    }
    return {
        scheme: url.protocol === "postgresql:" ? "postgresql" : "postgres",
        host: url.hostname,
        port: url.port ? Number(url.port) : 5432,
        database: url.pathname.replace(/^\//, ""),
        user: decodeURIComponent(url.username),
        password: Redacted.make(decodeURIComponent(url.password)),
    };
};
//# sourceMappingURL=PostgresOrigin.js.map