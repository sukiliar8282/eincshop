import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Devices.PostureIntegration";
/**
 * A Cloudflare Zero Trust **device posture integration** — a service-to-
 * service connection to a third-party endpoint security provider
 * (CrowdStrike, Intune, Kolide, Workspace ONE, ...) whose signals power
 * `*_s2s` device posture rules.
 *
 * Cloudflare validates the configured credentials against the live
 * provider API at create/update time, so a reachable third-party tenant
 * is required.
 * ### Creating a posture integration
 * **Example:** CrowdStrike Falcon
 * ```typescript
 * const falcon = yield* Cloudflare.Devices.DevicePostureIntegration("Falcon", {
 *   type: "crowdstrike_s2s",
 *   interval: "10m",
 *   config: {
 *     apiUrl: "https://api.crowdstrike.com",
 *     clientId: Alchemy.env("CROWDSTRIKE_CLIENT_ID"),
 *     clientSecret: Redacted.make(process.env.CROWDSTRIKE_SECRET!),
 *     customerId: "ccid-1234",
 *   },
 * });
 * ```
 *
 * **Example:** Custom service-to-service provider behind Access
 * ```typescript
 * const custom = yield* Cloudflare.Devices.DevicePostureIntegration("Custom", {
 *   type: "custom_s2s",
 *   interval: "30m",
 *   config: {
 *     apiUrl: "https://posture.example.com/check",
 *     clientSecret: Redacted.make(process.env.POSTURE_SECRET!),
 *     accessClientId: serviceToken.clientId,
 *     accessClientSecret: serviceToken.clientSecret,
 *   },
 * });
 * ```
 *
 * **Example:** Reference the integration from a posture rule
 * ```typescript
 * yield* Cloudflare.Devices.DevicePostureRule("FalconScore", {
 *   type: "crowdstrike_s2s",
 *   input: { connectionId: falcon.integrationId, os: "windows" },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/identity/devices/service-providers/
 *
 * @resource
 * @product Devices
 * @category Cloudflare One (Zero Trust)
 */
export const DevicePostureIntegration = Resource(TypeId);
/**
 * Returns true if the given value is a DevicePostureIntegration resource.
 */
export const isDevicePostureIntegration = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const DevicePostureIntegrationProvider = () => Provider.succeed(DevicePostureIntegration, {
    stables: ["integrationId", "accountId", "type"],
    // Account collection — enumerate every posture integration in the
    // ambient account, exhaustively paginating the distilled list op.
    // Zero Trust is plan-gated; a `Forbidden` rejection means the account
    // lacks the entitlement, so treat it as "nothing to list".
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* zeroTrust.listDevicePostureIntegrations
            .pages({ accountId })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((i) => toAttributes(i, accountId)))), Effect.catchTag("Forbidden", () => Effect.succeed([])));
    }),
    diff: Effect.fn(function* ({ olds, news, output }) {
        if (!isResolved(news))
            return undefined;
        // The provider type is immutable on Cloudflare's side — the config
        // shapes are disjoint, so model a type change as replacement.
        const oldType = output?.type ?? olds?.type;
        if (oldType !== undefined && oldType !== news.type) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.integrationId) {
            const observed = yield* observeIntegration(acct, output.integrationId);
            return observed ? toAttributes(observed, acct) : undefined;
        }
        // Cold lookup by deterministic name. The list result carries no
        // ownership markers, so brand the match `Unowned` and let the
        // engine gate takeover behind the adopt policy.
        const name = yield* createIntegrationName(id, olds?.name);
        const match = yield* findByName(acct, name);
        if (match)
            return Unowned(toAttributes(match, acct));
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = yield* createIntegrationName(id, news.name);
        // 1. Observe — `output.integrationId` is a cached hint; fall back to
        //    a name scan so a crashed prior run converges.
        let observed = output?.integrationId
            ? yield* observeIntegration(accountId, output.integrationId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(accountId, name);
        }
        // 2. Ensure — create when missing.
        if (!observed) {
            const created = yield* zeroTrust.createDevicePostureIntegration({
                accountId,
                name,
                type: news.type,
                interval: news.interval,
                config: encodeConfig(news.config),
            });
            return toAttributes(created, accountId);
        }
        // 3. Sync — secrets are masked on reads so they cannot be diffed
        //    against observed state; PATCH when any observable field drifts
        //    OR when the desired config carries secrets that may have
        //    rotated. Cloudflare re-validates credentials on PATCH, so only
        //    send config when the non-secret surface differs.
        const sameObservable = (observed.name ?? "") === name &&
            (observed.interval ?? "") === news.interval &&
            sameObservedConfig(observed.config, news.config);
        if (sameObservable) {
            return toAttributes(observed, accountId);
        }
        const updated = yield* zeroTrust.patchDevicePostureIntegration({
            accountId,
            integrationId: observed.id,
            name,
            type: news.type,
            interval: news.interval,
            config: encodeConfig(news.config),
        });
        return toAttributes(updated, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* zeroTrust
            .deleteDevicePostureIntegration({
            accountId: output.accountId,
            integrationId: output.integrationId,
        })
            .pipe(Effect.catchTag("DevicePostureIntegrationNotFound", () => Effect.void));
    }),
});
/**
 * Read an integration by id, mapping "gone" to `undefined`.
 */
const observeIntegration = (accountId, integrationId) => zeroTrust
    .getDevicePostureIntegration({ accountId, integrationId })
    .pipe(Effect.catchTag("DevicePostureIntegrationNotFound", () => Effect.succeed(undefined)));
/**
 * Find an integration by exact name.
 */
const findByName = (accountId, name) => zeroTrust
    .listDevicePostureIntegrations({ accountId })
    .pipe(Effect.map((list) => list.result.find((i) => i.name === name && i.id != null)));
const createIntegrationName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
/**
 * Project the alchemy config (flat, secrets `Redacted`) onto the wire
 * shape. The distilled request type is a union of per-provider structs;
 * the API discriminates by the sibling `type` field, so a single
 * present-fields projection is sufficient. The localized cast bridges the
 * flat shape to the union — it never touches error handling.
 */
const encodeConfig = (config) => {
    const out = {};
    if (config.apiUrl !== undefined)
        out.apiUrl = config.apiUrl;
    if (config.authUrl !== undefined)
        out.authUrl = config.authUrl;
    if (config.clientId !== undefined)
        out.clientId = config.clientId;
    if (config.clientKey !== undefined)
        out.clientKey = config.clientKey;
    if (config.customerId !== undefined)
        out.customerId = config.customerId;
    if (config.clientSecret !== undefined) {
        out.clientSecret = Redacted.value(config.clientSecret);
    }
    if (config.accessClientId !== undefined) {
        out.accessClientId = config.accessClientId;
    }
    if (config.accessClientSecret !== undefined) {
        out.accessClientSecret = Redacted.value(config.accessClientSecret);
    }
    return out;
};
/**
 * Compare only the fields Cloudflare echoes back (secrets are masked).
 */
const sameObservedConfig = (observed, desired) => observed != null &&
    (desired.apiUrl === undefined || observed.apiUrl === desired.apiUrl) &&
    (desired.authUrl === undefined || observed.authUrl === desired.authUrl) &&
    (desired.clientId === undefined || observed.clientId === desired.clientId);
const toAttributes = (integration, accountId) => ({
    integrationId: integration.id ?? "",
    accountId,
    name: integration.name ?? "",
    type: (integration.type ?? "custom_s2s"),
    interval: integration.interval ?? "",
    config: {
        apiUrl: integration.config?.apiUrl ?? undefined,
        authUrl: integration.config?.authUrl ?? undefined,
        clientId: integration.config?.clientId ?? undefined,
    },
});
//# sourceMappingURL=PostureIntegration.js.map