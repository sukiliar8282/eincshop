import * as workers from "@distilled.cloud/cloudflare/workers";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { AuthProviders } from "../../Auth/AuthProvider.js";
import { resolveProfileName, withProfileOverride } from "../../Auth/Resolve.js";
import * as CloudflareAccess from "../../Cloudflare/Access.js";
import { CloudflareAuth } from "../../Cloudflare/Auth/AuthProvider.js";
import * as CloudflareEnvironment from "../../Cloudflare/CloudflareEnvironment.js";
import * as CloudflareCredentials from "../../Cloudflare/Credentials.js";
import { CloudflareLogs } from "../../Cloudflare/Logs.js";
import { STATE_STORE_SCRIPT_NAME } from "../../Cloudflare/StateStore/Api.js";
import { bootstrap as bootstrapStateStore, teardownStateStore, } from "../../Cloudflare/StateStore/State.js";
import { loadConfigProvider } from "../../Util/ConfigProvider.js";
import { fileLogger } from "../../Util/FileLogger.js";
const logEntry = (scriptName, line) => ({
    resource: {
        fqn: scriptName,
        logicalId: scriptName,
        resourceType: "Cloudflare.Worker",
    },
    timestamp: line.timestamp,
    message: line.message,
});
const services = Effect.fn(function* (target) {
    const auth = Layer.provideMerge(CloudflareAuth, Layer.succeed(AuthProviders, {}));
    // `provideMerge` (not `mergeAll`) so `fromProfile` / `fromAuthProvider`
    // actually *see* `--profile`. Sibling-merging ConfigProvider left those
    // layers requiring it from the outer CLI `fromEnv()` — which is how
    // `alchemy provider cloudflare bootstrap --profile <name>` ignored the
    // flag and resolved the default profile (#252).
    const config = ConfigProvider.layer(withProfileOverride(yield* loadConfigProvider(Option.fromNullishOr(target.envFile)), target.profile));
    return Layer.mergeAll(Layer.provideMerge(Layer.mergeAll(CloudflareCredentials.fromAuthProvider(), CloudflareEnvironment.fromProfile(), CloudflareAccess.AccessLive), auth).pipe(Layer.provideMerge(config)), Logger.layer([fileLogger("cloudflare.txt")], { mergeWithExisting: true }));
});
/**
 * Resolve the profile, Cloudflare account, and provider layer every
 * state-store route (`bootstrap`, `teardown`, logs) is scoped to.
 */
export const resolveStateStoreScope = Effect.fn(function* (target) {
    const profile = yield* resolveProfileName(Option.fromNullishOr(target.envFile), target.profile);
    const resolved = { ...target, profile };
    const layer = yield* services(resolved);
    const { accountId } = yield* Effect.flatten(CloudflareEnvironment.CloudflareEnvironment).pipe(Effect.provide(layer));
    return {
        layer,
        profile,
        accountId,
        workerName: target.workerName ?? STATE_STORE_SCRIPT_NAME,
    };
});
/** Provision (or adopt) the Cloudflare-hosted state-store worker. */
export const bootstrap = Effect.fn("Alchemist.provider.cloudflare.bootstrap")(function* (input) {
    const { layer, accountId, workerName, profile } = yield* resolveStateStoreScope(input);
    return yield* Effect.gen(function* () {
        const existed = yield* workers
            .getScriptSetting({ accountId, scriptName: workerName })
            .pipe(Effect.as(true), Effect.catchTag(["WorkerNotFound", "InvalidRoute", "WorkerHasNoVersions"], () => Effect.succeed(false)));
        const state = yield* bootstrapStateStore({
            workerName,
            force: input.force,
            profile,
        });
        return {
            accountId,
            workerName,
            status: !existed
                ? "created"
                : input.force
                    ? "redeployed"
                    : "adopted",
            credentialsRefreshed: true,
            stateStoreVersion: yield* state.getVersion(),
        };
    }).pipe(Effect.provide(layer));
});
/** Tear down the Cloudflare-hosted state store. */
export const teardown = Effect.fn("Alchemist.provider.cloudflare.teardown")(function* (input) {
    const { layer, accountId, workerName, profile } = yield* resolveStateStoreScope(input);
    yield* Effect.provide(teardownStateStore({ workerName, profile }), layer);
    return { accountId, workerName, deleted: [workerName] };
});
/** Query past log entries from the state-store worker, oldest first. */
export const stateLogs = Effect.fn("Alchemist.provider.cloudflare.stateLogs")(function* (input) {
    const { layer, accountId, workerName } = yield* resolveStateStoreScope(input);
    const lines = yield* Effect.gen(function* () {
        const telemetry = yield* CloudflareLogs;
        return yield* telemetry.queryLogs({
            accountId,
            filters: [
                {
                    key: "$workers.scriptName",
                    operation: "eq",
                    type: "string",
                    value: workerName,
                },
            ],
            options: { limit: input.limit ?? 100, since: input.since },
        });
    }).pipe(Effect.provide(layer));
    return lines
        .map((line) => logEntry(workerName, line))
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
});
/** Live-stream log entries from the state-store worker. */
export const tailStateLogs = (input) => Stream.unwrap(Effect.gen(function* () {
    const { layer, accountId, workerName } = yield* resolveStateStoreScope(input);
    const telemetry = yield* Effect.provide(CloudflareLogs, layer);
    return telemetry.tailScript({ accountId, scriptName: workerName }).pipe(Stream.provide(layer), Stream.map((line) => logEntry(workerName, line)));
}));
//# sourceMappingURL=cloudflare.js.map