import * as d1 from "@distilled.cloud/cloudflare/d1";
import * as Effect from "effect/Effect";
import { PreparedStatement, } from "./QueryDatabase.js";
/**
 * Build a {@link QueryDatabaseClient} over the D1 HTTP query API.
 *
 * `databaseId` is an Effect so the resolution stays deferred to each call —
 * inside an Action it resolves through the apply-time RuntimeContext. The
 * credentials are provided ONLY around the distilled op (via `auth.authorize`),
 * never around the id accessor, matching the KV / Vectorize Local variants.
 */
export const makeHttpQueryDatabaseClient = (auth, databaseId) => makeQueryDatabaseClientFrom(Effect.map(databaseId, (id) => makeHttpD1Database(auth, id)));
/**
 * Build a {@link QueryDatabaseClient} from a deferred `D1Database` — shared
 * by the cloud HTTP transport above and the local-simulator gateway
 * transport (`QueryDatabaseLocal` with a `dev:` id).
 */
export const makeQueryDatabaseClientFrom = (rawEff) => {
    return {
        raw: rawEff,
        prepare: (query) => new PreparedStatement(query, [], rawEff),
        exec: (query) => Effect.flatMap(rawEff, (raw) => Effect.promise(() => raw.exec(query))),
        batch: (statements) => Effect.flatMap(rawEff, (raw) => Effect.promise(() => raw.batch(statements.map((s) => s._build(raw))))),
    };
};
const runQuery = (auth, databaseId, body) => auth
    .authorize(d1.queryDatabase({
    accountId: auth.accountId,
    databaseId,
    ...body,
}))
    .pipe(Effect.runPromise);
const toResult = (r) => ({
    results: (r?.results ?? []),
    success: r?.success ?? true,
    meta: (r?.meta ?? {}),
});
/**
 * Normalize a bound value the way the native D1 binding does before it reaches
 * SQLite. Over the raw HTTP query API, unlike the Worker binding, values are
 * bound verbatim — a JS `true` would arrive as the string `"true"`. Match the
 * native semantics: booleans become integers (1/0) and binary becomes a byte
 * array (BLOB). `null`, numbers, and strings pass through unchanged.
 */
const normalizeBind = (value) => {
    if (typeof value === "boolean")
        return value ? 1 : 0;
    if (value instanceof ArrayBuffer) {
        return Array.from(new Uint8Array(value));
    }
    if (ArrayBuffer.isView(value)) {
        return Array.from(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
    }
    return value;
};
/** A `D1Database` facade over the cloud HTTP query API. */
export const makeHttpD1Database = (auth, databaseId) => makeD1DatabaseFromTransport((body) => runQuery(auth, databaseId, body));
export const makeD1DatabaseFromTransport = (transport) => {
    const makeStatement = (query, binds) => {
        const exec = async () => {
            const res = await transport({
                sql: query,
                params: binds.length ? binds.map(normalizeBind) : undefined,
            });
            return res.result[0];
        };
        return {
            bind: (...values) => makeStatement(query, values),
            first: (async (column) => {
                const first = (await exec())?.results?.[0];
                if (first == null)
                    return null;
                return column !== undefined ? (first[column] ?? null) : first;
            }),
            all: (async () => toResult(await exec())),
            run: (async () => toResult(await exec())),
            raw: (async (options) => {
                const rows = ((await exec())?.results ?? []);
                const arrays = rows.map((row) => Object.values(row));
                if (options?.columnNames && rows[0]) {
                    return [Object.keys(rows[0]), ...arrays];
                }
                return arrays;
            }),
            // Carry query + params so `batch` can reconstruct the request.
            __query: query,
            __params: binds,
        };
    };
    return {
        prepare: (query) => makeStatement(query, []),
        exec: async (query) => {
            const res = await transport({ sql: query });
            const meta = res.result[res.result.length - 1]?.meta;
            return {
                count: res.result.length,
                duration: meta?.duration ?? 0,
            };
        },
        batch: async (statements) => {
            const res = await transport({
                batch: statements.map((s) => ({
                    sql: s.__query,
                    params: s.__params.length
                        ? s.__params.map(normalizeBind)
                        : undefined,
                })),
            });
            return res.result.map((r) => toResult(r));
        },
    };
};
//# sourceMappingURL=QueryDatabaseHttpClient.js.map