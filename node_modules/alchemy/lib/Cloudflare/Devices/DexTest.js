import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Devices.DexTest";
/**
 * A Cloudflare Zero Trust **DEX synthetic test** — an HTTP or traceroute
 * probe that enrolled WARP devices run on a schedule so the Digital
 * Experience Monitoring dashboard can chart reachability and latency to
 * your critical applications.
 *
 * Requires the DEX entitlement on the account (the API rejects writes
 * with `Forbidden` / `dex.api.entitlements.missing` otherwise).
 * ### Creating a DEX test
 * **Example:** HTTP probe every 30 minutes
 * ```typescript
 * const test = yield* Cloudflare.Devices.DeviceDexTest("AppHealth", {
 *   data: { host: "https://app.example.com/health", kind: "http", method: "GET" },
 *   interval: "0h30m0s",
 *   description: "Internal app reachability",
 * });
 * ```
 *
 * **Example:** Traceroute probe targeting specific device profiles
 * ```typescript
 * const trace = yield* Cloudflare.Devices.DeviceDexTest("OriginTrace", {
 *   data: { host: "203.0.113.10", kind: "traceroute" },
 *   interval: "0h30m0s",
 *   targeted: true,
 *   targetPolicies: [{ id: profile.policyId }],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/insights/dex/tests/
 *
 * @resource
 * @product Devices
 * @category Cloudflare One (Zero Trust)
 */
export const DeviceDexTest = Resource(TypeId);
/**
 * Returns true if the given value is a DeviceDexTest resource.
 */
export const isDeviceDexTest = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const DeviceDexTestProvider = () => Provider.succeed(DeviceDexTest, {
    stables: ["testId", "accountId"],
    // Account-scoped collection: paginate the DEX tests list and hydrate each
    // row (which already carries the full read shape) into Attributes. DEX
    // requires the Digital Experience Monitoring entitlement; on unentitled
    // accounts the list rejects with the typed `Forbidden`
    // (dex.api.entitlements.missing), so treat that as "nothing to enumerate".
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* zeroTrust.listDeviceDexTests.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .filter((t) => t.testId != null)
            .map((t) => toAttributes(t, accountId)))), Effect.catchTag("Forbidden", () => Effect.succeed([])));
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.testId) {
            const observed = yield* observeTest(acct, output.testId);
            return observed ? toAttributes(observed, acct) : undefined;
        }
        // Cold lookup: DEX test names are unique per account, but carry no
        // ownership markers — brand the match `Unowned`.
        const name = yield* createTestName(id, olds?.name);
        const match = yield* findByName(acct, name);
        if (match)
            return Unowned(toAttributes(match, acct));
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = yield* createTestName(id, news.name);
        // 1. Observe — cached id is a hint; fall back to a name scan.
        let observed = output?.testId
            ? yield* observeTest(accountId, output.testId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(accountId, name);
        }
        // 2. Ensure — create when missing.
        if (!observed) {
            const created = yield* zeroTrust.createDeviceDexTest({
                accountId,
                name,
                enabled: news.enabled ?? true,
                interval: news.interval,
                data: encodeData(news.data),
                ...(news.description !== undefined
                    ? { description: news.description }
                    : {}),
                ...(news.targeted !== undefined ? { targeted: news.targeted } : {}),
                ...(news.targetPolicies !== undefined
                    ? { targetPolicies: news.targetPolicies }
                    : {}),
            });
            return toAttributes(created, accountId);
        }
        // 3. Sync — PUT the full desired state when the observed state
        //    differs; skip the call on a no-op.
        const dirty = (observed.name ?? "") !== name ||
            (observed.interval ?? "") !== news.interval ||
            (observed.enabled ?? true) !== (news.enabled ?? true) ||
            (observed.description ?? undefined) !== news.description ||
            !sameData(observed.data, news.data);
        if (!dirty) {
            return toAttributes(observed, accountId);
        }
        const updated = yield* zeroTrust.updateDeviceDexTest({
            accountId,
            dexTestId: observed.testId,
            name,
            enabled: news.enabled ?? true,
            interval: news.interval,
            data: encodeData(news.data),
            ...(news.description !== undefined
                ? { description: news.description }
                : {}),
            ...(news.targeted !== undefined ? { targeted: news.targeted } : {}),
            ...(news.targetPolicies !== undefined
                ? { targetPolicies: news.targetPolicies }
                : {}),
        });
        return toAttributes(updated, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* zeroTrust
            .deleteDeviceDexTest({
            accountId: output.accountId,
            dexTestId: output.testId,
        })
            .pipe(Effect.catchTag("DexTestNotFound", () => Effect.void));
    }),
});
/**
 * Read a DEX test by id, mapping "gone" to `undefined`.
 */
const observeTest = (accountId, dexTestId) => zeroTrust
    .getDeviceDexTest({ accountId, dexTestId })
    .pipe(Effect.catchTag("DexTestNotFound", () => Effect.succeed(undefined)));
/**
 * Find a DEX test by exact name (names are unique per account).
 */
const findByName = (accountId, name) => zeroTrust
    .listDeviceDexTests({ accountId })
    .pipe(Effect.map((list) => (list.result ?? []).find((t) => t.name === name && t.testId != null)));
const createTestName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const encodeData = (data) => ({
    host: data.host,
    kind: data.kind,
    ...(data.method !== undefined ? { method: data.method } : {}),
});
const sameData = (observed, desired) => observed.host === desired.host &&
    observed.kind === desired.kind &&
    (observed.method ?? undefined) === desired.method;
const toAttributes = (test, accountId) => ({
    testId: test.testId ?? "",
    accountId,
    name: test.name,
    data: {
        host: test.data.host,
        kind: test.data.kind === "traceroute" ? "traceroute" : "http",
        ...(test.data.method != null ? { method: test.data.method } : {}),
    },
    interval: test.interval,
    enabled: test.enabled,
    description: test.description ?? undefined,
});
//# sourceMappingURL=DexTest.js.map