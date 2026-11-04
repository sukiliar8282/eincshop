import * as Layer from "effect/Layer";
import { ConnectMySQL } from "./ConnectMySQL.ts";
/**
 * Implementation of {@link ConnectMySQL}. Provide it on the
 * {@link Service} Effect.
 *
 * At deploy time this packs the private connection URI onto the host
 * (`RAILWAY_MYSQL_*`, `MYSQL_URL`). At runtime the client reads
 * `process.env`.
 *
 *
 * ### Provide the layer
 * **Example:** On a Service
 * ```typescript
 * Effect.gen(function* () {
 *   const conn = yield* Railway.ConnectMySQL(Db);
 *   const db = yield* Drizzle.MySQL(conn.connectionString);
 * }).pipe(Effect.provide(Railway.ConnectMySQLHttp))
 * ```
 *
 * @layer
 * @provides Railway.ConnectMySQL
 */
export declare const ConnectMySQLHttp: Layer.Layer<ConnectMySQL, never, never>;
//# sourceMappingURL=ConnectMySQLHttp.d.ts.map