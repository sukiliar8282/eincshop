import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Binding from "../Binding.js";
import * as Output from "../Output.js";
import { unpackEnvValue } from "../RuntimeContext.js";
import { ConnectMySQL, MySQLUrlMissing, connectEnvKeys, } from "./ConnectMySQL.js";
import { isRailwayHost } from "./MountVolume.js";
import { MYSQL_URL_SECRET, MYSQL_PUBLIC_URL_SECRET, } from "./MySQL.js";
const runtimeOutput = (key, output) => output.bind(key).pipe(Effect.flatMap((effect) => effect));
const asRedactedUrl = (value, name) => value.length > 0
    ? Effect.succeed(Redacted.make(value))
    : Effect.fail(new MySQLUrlMissing({ name }));
const fromProcessEnv = (key) => {
    const unpacked = unpackEnvValue(process.env[key]);
    if (typeof unpacked === "string")
        return unpacked;
    if (Redacted.isRedacted(unpacked)) {
        const inner = Redacted.value(unpacked);
        return typeof inner === "string" ? inner : "";
    }
    return "";
};
const firstUrl = (values, name) => {
    const found = values.find((value) => value.length > 0);
    return found !== undefined
        ? asRedactedUrl(found, name)
        : Effect.fail(new MySQLUrlMissing({ name }));
};
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
export const ConnectMySQLHttp = Layer.effect(ConnectMySQL, Effect.succeed(Effect.fn(function* (mysql) {
    const keys = connectEnvKeys(mysql);
    const name = mysql.LogicalId;
    if (!globalThis.__ALCHEMY_RUNTIME__) {
        const host = yield* Binding.Host;
        if (isRailwayHost(host)) {
            yield* host.bind `${mysql}`({
                env: {
                    [keys.pooled]: mysql.connectionUri,
                    [keys.direct]: mysql.connectionUri,
                    [MYSQL_URL_SECRET]: mysql.connectionUri,
                },
            });
        }
    }
    const fromEnv = (preferDirect) => firstUrl(preferDirect
        ? [
            fromProcessEnv(keys.direct),
            fromProcessEnv(MYSQL_URL_SECRET),
            fromProcessEnv(keys.pooled),
            fromProcessEnv(MYSQL_PUBLIC_URL_SECRET),
        ]
        : [
            fromProcessEnv(keys.pooled),
            fromProcessEnv(MYSQL_URL_SECRET),
            fromProcessEnv(keys.direct),
            fromProcessEnv(MYSQL_PUBLIC_URL_SECRET),
        ], name);
    if (globalThis.__ALCHEMY_RUNTIME__) {
        return {
            connectionString: fromEnv(false),
            directConnectionString: fromEnv(true),
        };
    }
    const pooled = runtimeOutput(keys.pooled, mysql.connectionUri);
    const direct = runtimeOutput(keys.direct, mysql.connectionUri);
    return {
        connectionString: Effect.gen(function* () {
            const packed = yield* pooled;
            const unpacked = yield* direct;
            return yield* firstUrl([
                typeof packed === "string" ? packed : "",
                fromProcessEnv(keys.pooled),
                fromProcessEnv(MYSQL_URL_SECRET),
                typeof unpacked === "string" ? unpacked : "",
                fromProcessEnv(keys.direct),
                fromProcessEnv(MYSQL_PUBLIC_URL_SECRET),
            ], name);
        }),
        directConnectionString: Effect.gen(function* () {
            const unpacked = yield* direct;
            const packed = yield* pooled;
            return yield* firstUrl([
                typeof unpacked === "string" ? unpacked : "",
                fromProcessEnv(keys.direct),
                fromProcessEnv(MYSQL_URL_SECRET),
                typeof packed === "string" ? packed : "",
                fromProcessEnv(keys.pooled),
                fromProcessEnv(MYSQL_PUBLIC_URL_SECRET),
            ], name);
        }),
    };
})));
//# sourceMappingURL=ConnectMySQLHttp.js.map