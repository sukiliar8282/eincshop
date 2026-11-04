import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Devices.Settings";
/**
 * Manages the **singleton** Cloudflare Zero Trust **device settings** for
 * an account (`/accounts/{accountId}/devices/settings`) — account-wide
 * WARP toggles like the Gateway TCP/UDP proxy, managed root certificate
 * installation, and CGNAT virtual IP.
 *
 * The singleton always exists, so reconcile patches only the declared
 * fields in place. The pre-management snapshot is captured on first touch
 * and restored on destroy (capture-and-restore), returning the account to
 * the state Alchemy found it in.
 * ### Managing device settings
 * **Example:** Enable the Gateway proxy
 * ```typescript
 * yield* Cloudflare.Devices.DeviceSettings("Devices", {
 *   gatewayProxyEnabled: true,
 *   gatewayUdpProxyEnabled: true,
 * });
 * ```
 *
 * **Example:** Allow one-hour WARP override codes
 * ```typescript
 * yield* Cloudflare.Devices.DeviceSettings("Devices", {
 *   disableForTime: 3600,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/
 *
 * @resource
 * @product Devices
 * @category Cloudflare One (Zero Trust)
 */
export const DeviceSettings = Resource(TypeId);
/**
 * Returns true if the given value is a DeviceSettings resource.
 */
export const isDeviceSettings = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const DeviceSettingsProvider = () => Provider.succeed(DeviceSettings, {
    nuke: { singleton: true },
    stables: ["accountId", "initialSettings"],
    // Account singleton: there is exactly one device-settings object per
    // account and no enumeration API. Mirror `read` — observe the single
    // singleton and return it as a one-element array. With no prior
    // output, the observed snapshot is itself the restore target.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const observed = yield* observeSettings(accountId);
        return [toAttributes(accountId, observed, observed)];
    }),
    read: Effect.fn(function* ({ output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const observed = yield* observeSettings(acct);
        // The singleton always exists with account defaults — there is
        // nothing to "own", so a cold read adopts freely. The observed
        // snapshot at adoption time becomes the restore target.
        const initialSettings = output?.initialSettings ?? observed;
        return toAttributes(acct, observed, initialSettings);
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // 1. Observe — the singleton always exists; read its live state.
        const observed = yield* observeSettings(accountId);
        // 2. Capture — the pre-management snapshot, restored on destroy.
        //    `output` (including an adoption read) already carries it;
        //    otherwise this is our first touch.
        const initialSettings = output?.initialSettings ?? observed;
        // 3. Sync — patch only the declared fields that differ.
        const changes = {};
        const assign = (key, value) => {
            changes[key] = value;
        };
        let dirty = false;
        for (const key of SETTING_KEYS) {
            const desired = news[key];
            if (desired === undefined)
                continue;
            if (observed[key] !== desired) {
                assign(key, desired);
                dirty = true;
            }
        }
        if (!dirty) {
            return toAttributes(accountId, observed, initialSettings);
        }
        yield* zeroTrust.patchDeviceSetting({ accountId, ...changes });
        // 4. Return — re-read so attrs reflect post-sync truth.
        const final = yield* observeSettings(accountId);
        return toAttributes(accountId, final, initialSettings);
    }),
    delete: Effect.fn(function* ({ output }) {
        const { accountId, initialSettings } = output;
        // Observe — skip the restore when the account already matches the
        // captured snapshot (idempotent re-delete after a crashed run).
        const observed = yield* observeSettings(accountId);
        if (sameSnapshot(observed, initialSettings))
            return;
        // Restore via PUT: fields absent from the captured snapshot were
        // unset before we managed the singleton, and PUT resets them.
        yield* zeroTrust.putDeviceSetting({ accountId, ...initialSettings });
    }),
});
const SETTING_KEYS = [
    "disableForTime",
    "externalEmergencySignalEnabled",
    "externalEmergencySignalFingerprint",
    "externalEmergencySignalInterval",
    "externalEmergencySignalUrl",
    "gatewayProxyEnabled",
    "gatewayUdpProxyEnabled",
    "rootCertificateInstallationEnabled",
    "useZtVirtualIp",
];
/**
 * Read the live settings, normalized to a `null`-free snapshot.
 */
const observeSettings = (accountId) => zeroTrust.getDeviceSetting({ accountId }).pipe(Effect.map((s) => {
    const snapshot = {};
    if (s.disableForTime != null)
        snapshot.disableForTime = s.disableForTime;
    if (s.externalEmergencySignalEnabled != null) {
        snapshot.externalEmergencySignalEnabled =
            s.externalEmergencySignalEnabled;
    }
    if (s.externalEmergencySignalFingerprint != null) {
        snapshot.externalEmergencySignalFingerprint =
            s.externalEmergencySignalFingerprint;
    }
    if (s.externalEmergencySignalInterval != null) {
        snapshot.externalEmergencySignalInterval =
            s.externalEmergencySignalInterval;
    }
    if (s.externalEmergencySignalUrl != null) {
        snapshot.externalEmergencySignalUrl = s.externalEmergencySignalUrl;
    }
    if (s.gatewayProxyEnabled != null) {
        snapshot.gatewayProxyEnabled = s.gatewayProxyEnabled;
    }
    if (s.gatewayUdpProxyEnabled != null) {
        snapshot.gatewayUdpProxyEnabled = s.gatewayUdpProxyEnabled;
    }
    if (s.rootCertificateInstallationEnabled != null) {
        snapshot.rootCertificateInstallationEnabled =
            s.rootCertificateInstallationEnabled;
    }
    if (s.useZtVirtualIp != null)
        snapshot.useZtVirtualIp = s.useZtVirtualIp;
    return snapshot;
}));
const toAttributes = (accountId, observed, initialSettings) => ({
    ...observed,
    accountId,
    initialSettings,
});
const sameSnapshot = (a, b) => SETTING_KEYS.every((key) => a[key] === b[key]);
//# sourceMappingURL=Settings.js.map