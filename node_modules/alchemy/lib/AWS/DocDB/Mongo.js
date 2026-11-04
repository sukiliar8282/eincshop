import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { makeExecutionMemo } from "../../Runtime/ExecutionMemo.js";
// `mongodb` is an optional peer dependency — loaded lazily so importing the
// AWS provider barrel never requires the driver unless a client is built.
const importMongodb = () => import("mongodb").catch((cause) => {
    throw new Error("Failed to load the 'mongodb' driver. Install the optional peer dependency 'mongodb' to connect to DocumentDB.", { cause });
});
/** A failure raised by the underlying `mongodb` driver. */
export class MongoError extends Data.TaggedError("AWS.DocDB.MongoError") {
    get message() {
        return String(this.cause);
    }
}
/**
 * Open an Effect-typed MongoDB client from a DocumentDB connection (the
 * runtime Effect produced by binding `AWS.DocDB.Connect`).
 *
 * The connect work is deferred until first use and memoized on the current
 * execution's `Scope` (via `makeExecutionMemo`), so the driver connection is
 * built at most once per execution — a Lambda invocation or Worker event —
 * and its `close` finalizer fires when the execution settles, never held
 * across events. This is the one legal pooling shape on workerd (sockets are
 * IoContext-pinned) and the correct one on Lambda.
 *
 * DocumentDB authenticates over the MongoDB wire protocol: database users
 * and their built-in roles (`read`, `readWrite`, `dbAdmin`,
 * `clusterAdmin`, …) are managed *inside* the database with
 * `db.createUser(...)` — IAM only governs the management plane.
 * ### Connecting to a Cluster
 * **Example:** Query a Collection inside a Function
 * ```typescript
 * // init — bind the cluster, then build the client
 * const connect = yield* AWS.DocDB.Connect(cluster, { database: "app" });
 * const db = yield* AWS.DocDB.mongo(connect);
 *
 * // runtime — one driver connection per execution, closed on settle
 * const { use } = yield* db;
 * const open = yield* use((db) =>
 *   db.collection("orders").find({ open: true }).toArray(),
 * );
 * ```
 *
 * **Example:** Create a Database User (DB-plane auth)
 * ```typescript
 * const { use } = yield* db;
 * yield* use((db) =>
 *   db.admin().command({
 *     createUser: "reporting",
 *     pwd: reportingPassword,
 *     roles: [{ role: "read", db: "app" }],
 *   }),
 * );
 * ```
 *
 * @binding
 */
export const mongo = (connection, options) => makeExecutionMemo(Effect.gen(function* () {
    const info = yield* connection;
    const client = yield* Effect.acquireRelease(Effect.tryPromise({
        try: async () => {
            const { MongoClient } = await importMongodb();
            return new MongoClient(Redacted.value(info.url), {
                ...(options?.ca !== undefined
                    ? // A caller-supplied CA restores full identity verification
                        // (overriding the URL's tlsAllowInvalidCertificates).
                        { ca: options.ca, tlsAllowInvalidCertificates: false }
                    : {}),
                ...options?.clientOptions,
            }).connect();
        },
        catch: (cause) => new MongoError({ cause }),
    }), (client) => Effect.promise(() => client.close().catch(() => { })));
    const db = client.db(options?.database ?? info.database);
    const use = (fn) => Effect.tryPromise({
        try: () => fn(db, client),
        catch: (cause) => new MongoError({ cause }),
    });
    return { client, db, use };
}));
//# sourceMappingURL=Mongo.js.map