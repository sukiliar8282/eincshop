import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Binding from "../Binding.js";
import * as Output from "../Output.js";
import { unpackEnvValue } from "../RuntimeContext.js";
import { ConnectPostgres, DATABASE_PUBLIC_URL_SECRET, DATABASE_URL_SECRET, PostgresUrlMissing, connectEnvKeys, } from "./ConnectPostgres.js";
import { isRailwayHost } from "./MountVolume.js";
const runtimeOutput = (key, output) => output.bind(key).pipe(Effect.flatMap((effect) => effect));
const asRedactedUrl = (value, name) => value.length > 0
    ? Effect.succeed(Redacted.make(value))
    : Effect.fail(new PostgresUrlMissing({ name }));
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
        : Effect.fail(new PostgresUrlMissing({ name }));
};
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
export const ConnectPostgresHttp = Layer.effect(ConnectPostgres, Effect.succeed(Effect.fn(function* (postgres) {
    const keys = connectEnvKeys(postgres);
    const name = postgres.LogicalId;
    if (!globalThis.__ALCHEMY_RUNTIME__) {
        const host = yield* Binding.Host;
        if (isRailwayHost(host)) {
            yield* host.bind `${postgres}`({
                env: {
                    [keys.pooled]: postgres.connectionUri,
                    [keys.direct]: postgres.connectionUri,
                    [DATABASE_URL_SECRET]: postgres.connectionUri,
                },
            });
        }
    }
    const fromEnv = (preferDirect) => firstUrl(preferDirect
        ? [
            fromProcessEnv(keys.direct),
            fromProcessEnv(DATABASE_URL_SECRET),
            fromProcessEnv(keys.pooled),
            fromProcessEnv(DATABASE_PUBLIC_URL_SECRET),
        ]
        : [
            fromProcessEnv(keys.pooled),
            fromProcessEnv(DATABASE_URL_SECRET),
            fromProcessEnv(keys.direct),
            fromProcessEnv(DATABASE_PUBLIC_URL_SECRET),
        ], name);
    if (globalThis.__ALCHEMY_RUNTIME__) {
        return {
            connectionString: fromEnv(false),
            directConnectionString: fromEnv(true),
        };
    }
    const pooled = runtimeOutput(keys.pooled, postgres.connectionUri);
    const direct = runtimeOutput(keys.direct, postgres.connectionUri);
    return {
        connectionString: Effect.gen(function* () {
            const packed = yield* pooled;
            const unpacked = yield* direct;
            return yield* firstUrl([
                typeof packed === "string" ? packed : "",
                fromProcessEnv(keys.pooled),
                fromProcessEnv(DATABASE_URL_SECRET),
                typeof unpacked === "string" ? unpacked : "",
                fromProcessEnv(keys.direct),
                fromProcessEnv(DATABASE_PUBLIC_URL_SECRET),
            ], name);
        }),
        directConnectionString: Effect.gen(function* () {
            const unpacked = yield* direct;
            const packed = yield* pooled;
            return yield* firstUrl([
                typeof unpacked === "string" ? unpacked : "",
                fromProcessEnv(keys.direct),
                fromProcessEnv(DATABASE_URL_SECRET),
                typeof packed === "string" ? packed : "",
                fromProcessEnv(keys.pooled),
                fromProcessEnv(DATABASE_PUBLIC_URL_SECRET),
            ], name);
        }),
    };
})));
//# sourceMappingURL=ConnectPostgresHttp.js.map