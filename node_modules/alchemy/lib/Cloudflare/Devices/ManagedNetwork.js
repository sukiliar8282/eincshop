import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Devices.ManagedNetwork";
/**
 * A Cloudflare Zero Trust **device managed network** — a TLS endpoint the
 * WARP client probes to detect whether the device is on a known network.
 * Device profiles can then `match` on `network` to apply different WARP
 * settings on trusted networks.
 *
 * Name and config are mutable in place (PUT). `tls` is the only network
 * type Cloudflare supports.
 * ### Creating a managed network
 * **Example:** Detect the office network by TLS fingerprint
 * ```typescript
 * const network = yield* Cloudflare.Devices.DeviceManagedNetwork("Office", {
 *   config: {
 *     tlsSockaddr: "192.0.2.1:443",
 *     sha256:
 *       "b5bb9d8014a0f9b1d61e21e796d78dccdf1352f23cd32812f4850b878ae4944c",
 *   },
 * });
 * ```
 *
 * **Example:** Use the network in a custom device profile
 * ```typescript
 * yield* Cloudflare.Devices.DeviceCustomProfile("OnPrem", {
 *   match: `network == "${network.name}"`,
 *   precedence: 100,
 *   serviceModeV2: { mode: "proxy", port: 3000 },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/configure-warp/managed-networks/
 *
 * @resource
 * @product Devices
 * @category Cloudflare One (Zero Trust)
 */
export const DeviceManagedNetwork = Resource(TypeId);
/**
 * Returns true if the given value is a DeviceManagedNetwork resource.
 */
export const isDeviceManagedNetwork = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const DeviceManagedNetworkProvider = () => Provider.succeed(DeviceManagedNetwork, {
    stables: ["networkId", "accountId", "type"],
    // Account collection: managed networks are account-scoped and the
    // distilled list op paginates (items: "result"). Enumerate every page
    // and hydrate into the exact `read` Attributes shape via `toAttributes`.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* zeroTrust.listDeviceNetworks.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .filter((n) => n.networkId != null)
            .map((n) => toAttributes(n, accountId)))));
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        // Owned path: refresh by our persisted network id.
        if (output?.networkId) {
            const observed = yield* observeNetwork(acct, output.networkId);
            return observed ? toAttributes(observed, acct) : undefined;
        }
        // Cold lookup: names are unique per account, so an exact match
        // identifies the network — but it carries no ownership markers, so
        // brand it `Unowned` and let the engine gate takeover behind the
        // adopt policy.
        const name = yield* createNetworkName(id, olds?.name);
        const match = yield* findByName(acct, name);
        if (match)
            return Unowned(toAttributes(match, acct));
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = yield* createNetworkName(id, news.name);
        // 1. Observe — the network id cached on `output` is a hint, not a
        //    guarantee. Names are unique per account, so also scan by name
        //    to converge on a network created by a crashed prior run.
        let observed = output?.networkId
            ? yield* observeNetwork(accountId, output.networkId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(accountId, name);
        }
        // 2. Ensure — create when missing.
        if (!observed) {
            const created = yield* zeroTrust.createDeviceNetwork({
                accountId,
                name,
                type: "tls",
                config: encodeConfig(news.config),
            });
            return toAttributes(created, accountId);
        }
        // 3. Sync — PUT name/config when the observed state differs; skip
        //    the call entirely on a no-op.
        const dirty = (observed.name ?? "") !== name ||
            !sameConfig(observed.config, news.config);
        if (!dirty) {
            return toAttributes(observed, accountId);
        }
        const updated = yield* zeroTrust.updateDeviceNetwork({
            accountId,
            networkId: observed.networkId,
            name,
            type: "tls",
            config: encodeConfig(news.config),
        });
        return toAttributes(updated, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        // Cloudflare's delete is already idempotent (200 on a missing
        // network); the typed catch covers the documented error path too.
        yield* zeroTrust
            .deleteDeviceNetwork({
            accountId: output.accountId,
            networkId: output.networkId,
        })
            .pipe(Effect.catchTag("DeviceNetworkNotFound", () => Effect.void));
    }),
});
/**
 * Read a managed network by id, mapping "gone" (`DeviceNetworkNotFound`,
 * Cloudflare error code 2053) to `undefined`.
 */
const observeNetwork = (accountId, networkId) => zeroTrust
    .getDeviceNetwork({ accountId, networkId })
    .pipe(Effect.catchTag("DeviceNetworkNotFound", () => Effect.succeed(undefined)));
/**
 * Find a managed network by exact name. Names are unique per account.
 */
const findByName = (accountId, name) => zeroTrust
    .listDeviceNetworks({ accountId })
    .pipe(Effect.map((list) => list.result.find((n) => n.name === name && n.networkId != null)));
const createNetworkName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const encodeConfig = (config) => {
    const out = {
        tlsSockaddr: config.tlsSockaddr,
    };
    if (config.sha256 !== undefined)
        out.sha256 = config.sha256;
    return out;
};
const sameConfig = (observed, desired) => observed != null &&
    observed.tlsSockaddr === desired.tlsSockaddr &&
    (observed.sha256 ?? undefined) === desired.sha256;
const toAttributes = (network, accountId) => ({
    networkId: network.networkId ?? "",
    accountId,
    name: network.name ?? "",
    type: "tls",
    config: {
        tlsSockaddr: network.config?.tlsSockaddr ?? "",
        sha256: network.config?.sha256 ?? undefined,
    },
});
//# sourceMappingURL=ManagedNetwork.js.map