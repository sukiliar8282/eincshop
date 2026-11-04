import * as Layer from "effect/Layer";
import { ConnectMongo } from "./ConnectMongo.ts";
/**
 * Implementation of {@link ConnectMongo}. Provide it on the
 * {@link Service} Effect.
 *
 * At deploy time this packs the private connection URI onto the host
 * (`RAILWAY_MONGO_*`, `MONGO_URL`). At runtime the client reads
 * `process.env`.
 *
 *
 * ### Provide the layer
 * **Example:** On a Service
 * ```typescript
 * Effect.gen(function* () {
 *   const conn = yield* Railway.ConnectMongo(Db);
 *   const url = yield* conn.connectionString;
 * }).pipe(Effect.provide(Railway.ConnectMongoHttp))
 * ```
 *
 * @layer
 * @provides Railway.ConnectMongo
 */
export declare const ConnectMongoHttp: Layer.Layer<ConnectMongo, never, never>;
//# sourceMappingURL=ConnectMongoHttp.d.ts.map