import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import { makePgMigrationExecutor, runMigrations, } from "../SQL/Migrations/index.js";
import { importPg } from "../SQL/PostgresDriver.js";
import { readSqlFile } from "../SQL/SqlFile.js";
export class PostgresMigrationError extends Data.TaggedError("Fly.PostgresMigrationError") {
}
/**
 * Strip query-string SSL flags so `pg-connection-string` does not treat
 * `sslmode=require` as `verify-full`. TLS and certificate verification
 * are set on the client (`ssl.rejectUnauthorized: true`).
 */
export const stripSslQueryParams = (uri) => {
    try {
        const url = new URL(uri);
        url.searchParams.delete("sslmode");
        url.searchParams.delete("channel_binding");
        return url.toString();
    }
    catch {
        return uri;
    }
};
const toMigrationError = (cause) => new PostgresMigrationError({
    message: cause instanceof Error ? cause.message : String(cause),
    cause,
});
/**
 * A freshly-provisioned Fly Managed Postgres cluster reports `ready` on the
 * API before its hostname is resolvable and its endpoint accepts
 * connections — reconcile's first migration connect can fail with
 * `ENOTFOUND` (DNS still propagating) or a refused/reset socket. These are
 * eventual consistency, not failures: retry the connect on a bounded
 * schedule (~45s) before surfacing the error.
 */
const TRANSIENT_CONNECT_CODES = new Set([
    "ENOTFOUND",
    "EAI_AGAIN",
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
]);
const isTransientConnectError = (error) => {
    const code = error.cause?.code;
    return typeof code === "string" && TRANSIENT_CONNECT_CODES.has(code);
};
/** Open a pg client for the scope of `use`, closing it afterwards. */
export const withPgClient = (connectionUri, use) => Effect.acquireUseRelease(Effect.tryPromise({
    try: async () => {
        const { Client } = await importPg();
        const client = new Client({
            connectionString: stripSslQueryParams(Redacted.value(connectionUri)),
            ssl: { rejectUnauthorized: true },
        });
        await client.connect();
        return client;
    },
    catch: toMigrationError,
}).pipe(Effect.retry({
    while: isTransientConnectError,
    schedule: Schedule.spaced("3 seconds"),
    times: 15,
}), 
// Still unreachable after the bounded retry: almost always a missing
// route rather than propagation — MPG hostnames only exist on the org
// private network. Say so instead of a bare `getaddrinfo ENOTFOUND`.
Effect.mapError((error) => isTransientConnectError(error)
    ? new PostgresMigrationError({
        message: `${error.message} — Fly Managed Postgres is only reachable ` +
            "on the org's private network. Run the deploy behind a " +
            "WireGuard peer or `fly mpg proxy`, or from a machine on " +
            "6PN. See https://fly.io/docs/mpg/create-and-connect/",
        cause: error.cause,
    })
    : error)), use, (client) => Effect.promise(() => client.end().catch(() => { })));
/**
 * Fly Managed Postgres's migration adaptation is the shared pipeline
 * with a connection-URI-scoped pg client as its executor. Use the
 * direct (non-PgBouncer) URI so DDL and advisory locks work.
 */
export const runPgMigrations = (options) => runMigrations({
    ...options,
    withExecutor: (apply) => withPgClient(options.connectionUri, (client) => apply(makePgMigrationExecutor(client))),
});
/** Run a single SQL script against the database (used for `importFiles`). */
export const runSql = (connectionUri, sql) => withPgClient(connectionUri, (client) => Effect.tryPromise({
    try: () => client.query(sql),
    catch: toMigrationError,
})).pipe(Effect.asVoid);
export const runImports = (connectionUri, importFiles, rootDir, previous) => Effect.gen(function* () {
    const hashes = { ...previous };
    for (const filePath of importFiles) {
        const file = yield* readSqlFile(rootDir, filePath);
        if (previous[filePath] === file.hash) {
            hashes[filePath] = file.hash;
            continue;
        }
        yield* runSql(connectionUri, file.sql);
        hashes[filePath] = file.hash;
    }
    const tracked = new Set(importFiles);
    for (const key of Object.keys(hashes)) {
        if (!tracked.has(key))
            delete hashes[key];
    }
    return hashes;
});
//# sourceMappingURL=PostgresMigrations.js.map