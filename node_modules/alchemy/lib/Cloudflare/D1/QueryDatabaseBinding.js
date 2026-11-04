import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Worker, WorkerEnvironment } from "../Workers/Worker.js";
import { PreparedStatement, QueryDatabase, } from "./QueryDatabase.js";
export const QueryDatabaseBinding = Layer.effect(QueryDatabase, Effect.gen(function* () {
    const env = yield* WorkerEnvironment;
    const host = yield* Worker;
    return Effect.fn(function* (database) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* host.bind `${database}`({
                bindings: [
                    {
                        type: "d1",
                        name: database.LogicalId,
                        databaseId: database.databaseId,
                    },
                ],
            });
        }
        const rawEff = Effect.sync(() => env[database.LogicalId]);
        return {
            raw: rawEff,
            prepare: (query) => new PreparedStatement(query, [], rawEff),
            exec: (query) => Effect.flatMap(rawEff, (raw) => Effect.promise(() => raw.exec(query))),
            batch: (statements) => Effect.flatMap(rawEff, (raw) => Effect.promise(() => raw.batch(statements.map((s) => s._build(raw))))),
        };
    });
}));
//# sourceMappingURL=QueryDatabaseBinding.js.map