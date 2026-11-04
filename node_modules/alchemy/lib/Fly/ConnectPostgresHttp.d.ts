import * as Layer from "effect/Layer";
import { ConnectPostgres } from "./ConnectPostgres.ts";
/**
 * Implementation of {@link ConnectPostgres}. Provide it on the
 * {@link Service} Effect.
 *
 * At deploy time this registers the cluster on the host so Service
 * reconcile can attach it (6PN) and pack the connection URI. At
 * runtime the client reads `process.env` (`FLY_POSTGRES_*`, then
 * Fly's `DATABASE_URL` secret).
 *
 *
 * ### Provide the layer
 * **Example:** On a Service
 * ```typescript
 * Effect.gen(function* () {
 *   const conn = yield* Fly.ConnectPostgres(Db);
 *   const db = yield* Drizzle.Postgres(conn.connectionString);
 * }).pipe(Effect.provide(Fly.ConnectPostgresHttp))
 * ```
 *
 * @layer
 * @provides Fly.ConnectPostgres
 */
export declare const ConnectPostgresHttp: Layer.Layer<ConnectPostgres, never, never>;
//# sourceMappingURL=ConnectPostgresHttp.d.ts.map