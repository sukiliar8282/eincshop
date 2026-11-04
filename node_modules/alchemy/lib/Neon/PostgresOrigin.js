import * as Redacted from "effect/Redacted";
/**
 * Parse a Postgres connection URI into the structured origin shape.
 * Used to derive `branch.origin` / `project.origin` from the API
 * response's `connectionUri`.
 */
export const parsePostgresOrigin = (uri) => {
    const url = new URL(uri);
    const scheme = url.protocol === "postgresql:" ? "postgresql" : "postgres";
    return {
        scheme,
        host: url.hostname,
        port: url.port ? Number(url.port) : 5432,
        database: url.pathname.replace(/^\//, ""),
        user: decodeURIComponent(url.username),
        password: Redacted.make(decodeURIComponent(url.password)),
    };
};
//# sourceMappingURL=PostgresOrigin.js.map