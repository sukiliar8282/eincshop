import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Result from "effect/Result";
import { reconfigureHint, } from "./AuthProvider.js";
const broken = (name, method, severity, code, message) => ({
    name,
    method,
    status: severity === "warning" ? "needs-reauth" : "invalid",
    details: [],
    diagnostic: { severity, code, message },
});
/**
 * Resolve one stored provider's live connection status. Never fails: every
 * way this can go wrong is reported as a `status` + `diagnostic` so a listing
 * can show the whole profile.
 */
export const inspectProvider = Effect.fn("inspectProvider")(function* (profile, name, config, registered, updateConfig) {
    const method = config.method ?? "unknown";
    const provider = registered[name];
    if (provider === undefined) {
        return {
            name,
            method,
            status: "unavailable",
            details: [],
            diagnostic: {
                severity: "warning",
                code: "provider.unregistered",
                message: `Provider '${name}' is not registered.`,
            },
        };
    }
    // A deliberately empty migrated document records that the provider was
    // connected in v0 while making no claim that its obsolete credentials are
    // usable. Keep that distinct from malformed provider-owned values.
    if (config.method === undefined) {
        return {
            name,
            method,
            status: "needs-reconfigure",
            details: [],
            diagnostic: {
                severity: "warning",
                code: "provider.needs-reconfigure",
                message: `Provider '${name}' needs to be reconfigured. ${reconfigureHint(name, profile)}`,
            },
        };
    }
    const decoded = yield* Effect.result(provider.decodeConfig(profile, config));
    if (Result.isFailure(decoded)) {
        return broken(name, method, "error", "provider.invalid-config", decoded.failure.message);
    }
    const details = yield* Effect.result(provider.details(profile, decoded.success, updateConfig));
    if (Result.isSuccess(details)) {
        return {
            name,
            method,
            status: "connected",
            details: details.success.lines,
        };
    }
    // A provider that can no longer prove who it is has expired credentials,
    // which the user can fix by re-authenticating — not a broken config.
    const needsReauth = Predicate.isTagged("NeedsReauth")(details.failure);
    return broken(name, method, needsReauth ? "warning" : "error", needsReauth ? "provider.needs-reauth" : "provider.details-failed", details.failure.message);
});
//# sourceMappingURL=Inspect.js.map