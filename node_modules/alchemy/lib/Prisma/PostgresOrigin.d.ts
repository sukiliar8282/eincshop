import * as Redacted from "effect/Redacted";
/**
 * The shape `Cloudflare.Hyperdrive` and other Postgres consumers accept
 * as `origin`. Materialized on `Prisma.Connection` so callers can wire
 * Prisma Postgres into Hyperdrive directly:
 *
 * ```typescript
 * const connection = yield* Prisma.Connection("api", { database, name: "api" });
 * const hd = yield* Cloudflare.Hyperdrive.Connection("api-hd", {
 *   origin: connection.origin.as<Prisma.PostgresOrigin>(),
 * });
 * ```
 */
export type PostgresOrigin = {
    scheme: "postgres" | "postgresql";
    host: string;
    port: number;
    database: string;
    user: string;
    password: Redacted.Redacted<string>;
};
/**
 * Parse a Postgres connection URI into the structured origin shape. Used to
 * derive `connection.origin` / `connection.pooledOrigin` from the direct and
 * pooled connection strings Prisma returns.
 *
 * Returns `undefined` for non-Postgres URIs (e.g. `prisma://` Accelerate
 * connection strings) and malformed values.
 */
export declare const parsePostgresOrigin: (uri: string) => PostgresOrigin | undefined;
//# sourceMappingURL=PostgresOrigin.d.ts.map