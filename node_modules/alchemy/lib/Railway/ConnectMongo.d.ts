import type * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import * as Binding from "../Binding.ts";
import type { RuntimeContext } from "../RuntimeContext.ts";
import type { Mongo } from "./Mongo.ts";
/**
 * Bind a {@link Mongo} service to a Railway {@link Service} and obtain
 * the Effect-native connection string for the MongoDB driver.
 *
 * `ConnectMongo` is the Context tag, the type, and the callable —
 * `yield* Railway.ConnectMongo(Db)`. Provide {@link ConnectMongoHttp}.
 *
 * **Example:** Bind Mongo in a Service
 * ```typescript
 * import * as Redacted from "effect/Redacted";
 *
 * const conn = yield* Railway.ConnectMongo(Db);
 *
 * fetch: Effect.gen(function* () {
 *   const url = yield* conn.connectionString;
 *   const ping = yield* Railway.pingMongo(Redacted.value(url));
 * });
 * ```
 *
 * ### Variable references
 * `ConnectMongo` packs a typed private URI onto the Service. To store
 * Railway's template instead of a resolved URI (IaC `db.env.MONGO_URL`),
 * pass `Railway.ref(Db, "MONGO_URL")` as a {@link Variable} `value` or
 * `Service.env` entry.
 *
 * **Example:** Railway.ref
 * ```typescript
 * const db = yield* Railway.mongo("Db", { project: site });
 * yield* Railway.Variable("MongoUrl", {
 *   project: site,
 *   service: api,
 *   name: "MONGO_URL",
 *   value: Railway.ref(db, "MONGO_URL"),
 * });
 * ```
 *
 * @binding
 * @product Railway
 * @category Storage & Databases
 */
export interface ConnectMongo extends Binding.Service<ConnectMongo, "Railway.ConnectMongo", (mongo: Mongo) => Effect.Effect<ConnectMongoClient>> {
}
export declare const ConnectMongo: ConnectMongo;
export declare const connectEnvKeys: (mongo: Pick<Mongo, "LogicalId">) => {
    pooled: string;
    direct: string;
};
declare const MongoUrlMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Railway.MongoUrlMissing";
} & Readonly<A>;
export declare class MongoUrlMissing extends MongoUrlMissing_base<{
    name: string;
}> {
}
export interface ConnectMongoClient {
    /**
     * Private (`{name}.railway.internal`) connection string. Pass this to
     * the MongoDB driver from a {@link Service}.
     */
    connectionString: Effect.Effect<Redacted.Redacted<string>, MongoUrlMissing, RuntimeContext>;
    /**
     * Same private URI. Kept so callers matching the Postgres
     * `ConnectPostgres` shape keep working.
     */
    directConnectionString: Effect.Effect<Redacted.Redacted<string>, MongoUrlMissing, RuntimeContext>;
}
export {};
//# sourceMappingURL=ConnectMongo.d.ts.map