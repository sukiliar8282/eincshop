import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.js";
export const QueryDatabase = Binding.Service("Cloudflare.D1.QueryDatabase");
/**
 * Effect-native wrapper around a Cloudflare D1 prepared statement.
 *
 * Construction (`prepare`) and binding (`bind`) are synchronous —
 * they're plan builders and don't touch D1. Only the executors
 * (`all`, `first`, `run`, `raw`) round-trip to the database, and
 * those return Effects so they participate in the Effect runtime.
 */
export class PreparedStatement {
    query;
    binds;
    rawEff;
    /** @internal */
    constructor(query, binds, rawEff) {
        this.query = query;
        this.binds = binds;
        this.rawEff = rawEff;
    }
    /**
     * Return a new prepared statement bound to `values`. Subsequent
     * calls replace the previous binding, matching the underlying
     * Cloudflare runtime semantics.
     */
    bind(...values) {
        return new PreparedStatement(this.query, values, this.rawEff);
    }
    /** Run the query and return all matching rows. */
    all() {
        return this.withRuntime((stmt) => stmt.all());
    }
    first(column) {
        return this.withRuntime((stmt) => column !== undefined ? stmt.first(column) : stmt.first());
    }
    /** Run the query as a mutation; returns row metadata. */
    run() {
        return this.withRuntime((stmt) => stmt.run());
    }
    raw(options) {
        return this.withRuntime((stmt) => options
            ? stmt.raw(options)
            : stmt.raw());
    }
    /**
     * Materialize the underlying Cloudflare prepared statement against
     * a concrete D1 binding. Used by `QueryDatabaseClient.batch` to
     * collect statements for a single transactional call.
     *
     * @internal
     */
    _build(raw) {
        const stmt = raw.prepare(this.query);
        return this.binds.length > 0 ? stmt.bind(...this.binds) : stmt;
    }
    withRuntime(fn) {
        return Effect.flatMap(this.rawEff, (raw) => Effect.promise(() => fn(this._build(raw))));
    }
}
//# sourceMappingURL=QueryDatabase.js.map