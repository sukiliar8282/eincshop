import * as Layer from "effect/Layer";
import { ConnectPostgres } from "./ConnectPostgres.ts";
/**
 * Implementation of {@link ConnectPostgres}. Provide it on the
 * {@link Service} or {@link Function} Effect.
 *
 * At deploy time this packs the private connection URI onto the host
 * (`RAILWAY_POSTGRES_*`, `DATABASE_URL`). At runtime the client reads
 * `process.env`.
 *
 *
 * ### Provide the layer
 * **Example:** On a Function or Service
 * ```typescript
 * Effect.gen(function* () {
 *   const conn = yield* Railway.ConnectPostgres(Db);
 *   const db = yield* Drizzle.Postgres(conn.connectionString);
 * }).pipe(Effect.provide(Railway.ConnectPostgresHttp))
 * ```
 *
 * @layer
 * @provides Railway.ConnectPostgres
 */
export declare const ConnectPostgresHttp: Layer.Layer<ConnectPostgres, never, never>;
//# sourceMappingURL=ConnectPostgresHttp.d.ts.map