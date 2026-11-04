import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Devices.PostureRule";
/**
 * A Cloudflare Zero Trust **device posture rule** — a periodic check the
 * WARP client runs on enrolled devices (OS version, firewall status, disk
 * encryption, file presence, or a third-party security provider's
 * verdict). Posture results can then gate Access policies and Gateway
 * rules.
 *
 * Everything except `type` is mutable in place (full PUT). Changing
 * `type` replaces the rule.
 * ### Infrastructure-free checks
 * **Example:** Require a minimum Windows version
 * ```typescript
 * const rule = yield* Cloudflare.Devices.DevicePostureRule("WindowsOsVersion", {
 *   type: "os_version",
 *   description: "Require Windows 10.0.19045+",
 *   match: [{ platform: "windows" }],
 *   schedule: "5m",
 *   input: {
 *     operatingSystem: "windows",
 *     operator: ">=",
 *     version: "10.0.19045",
 *   },
 * });
 * ```
 *
 * **Example:** Require the OS firewall to be enabled
 * ```typescript
 * yield* Cloudflare.Devices.DevicePostureRule("Firewall", {
 *   type: "firewall",
 *   match: [{ platform: "windows" }, { platform: "mac" }],
 *   input: { enabled: true, operatingSystem: "windows" },
 * });
 * ```
 *
 * **Example:** Require disk encryption on all drives
 * ```typescript
 * yield* Cloudflare.Devices.DevicePostureRule("DiskEncryption", {
 *   type: "disk_encryption",
 *   match: [{ platform: "mac" }],
 *   input: { requireAll: true },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/identity/devices/
 *
 * @resource
 * @product Devices
 * @category Cloudflare One (Zero Trust)
 */
export const DevicePostureRule = Resource(TypeId);
/**
 * Returns true if the given value is a DevicePostureRule resource.
 */
export const isDevicePostureRule = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const DevicePostureRuleProvider = () => Provider.succeed(DevicePostureRule, {
    stables: ["postureRuleId", "accountId", "type"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Account-scoped collection: exhaustively paginate the device
        // posture rules list and hydrate each into the `read` shape.
        return yield* zeroTrust.listDevicePostures.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((rule) => toAttributes(rule, accountId)))), 
        // Account lacks the Zero Trust / device posture entitlement.
        Effect.catchTag("Forbidden", () => Effect.succeed([])));
    }),
    diff: Effect.fn(function* ({ olds, news, output }) {
        if (!isResolved(news))
            return undefined;
        // `type` is immutable on Cloudflare's side — replace on change.
        const oldType = output?.type ?? olds?.type;
        if (oldType !== undefined && oldType !== news.type) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        // Owned path: refresh by our persisted rule id.
        if (output?.postureRuleId) {
            const observed = yield* observeRule(acct, output.postureRuleId);
            return observed ? toAttributes(observed, acct) : undefined;
        }
        // Cold lookup: recover from lost state by exact name. Posture rules
        // carry no ownership markers, so brand the match `Unowned`.
        const name = yield* createRuleName(id, olds?.name);
        const match = yield* findByName(acct, name);
        if (match)
            return Unowned(toAttributes(match, acct));
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = yield* createRuleName(id, news.name);
        // 1. Observe — the rule id cached on `output` is a hint, not a
        //    guarantee: a missing rule falls through to create.
        const observed = output?.postureRuleId
            ? yield* observeRule(accountId, output.postureRuleId)
            : undefined;
        // 2. Ensure — create when missing. Names are not unique on
        //    Cloudflare's side, so there is no AlreadyExists race.
        if (!observed) {
            const created = yield* zeroTrust.createDevicePosture({
                accountId,
                name,
                type: news.type,
                description: news.description,
                schedule: news.schedule,
                expiration: news.expiration,
                match: news.match,
                input: news.input,
            });
            return toAttributes(created, accountId);
        }
        // 3. Sync — the update API is a PUT that requires the full body;
        //    send everything, but skip the call entirely on a no-op.
        const dirty = (observed.name ?? "") !== name ||
            (news.description !== undefined &&
                !sameJSON(denull(observed.description), news.description)) ||
            (news.schedule !== undefined &&
                denull(observed.schedule) !== news.schedule) ||
            (news.expiration !== undefined &&
                denull(observed.expiration) !== news.expiration) ||
            (news.match !== undefined &&
                !sameJSON(normalizeMatch(observed.match), news.match)) ||
            (news.input !== undefined && !sameJSON(observed.input, news.input));
        if (!dirty) {
            return toAttributes(observed, accountId);
        }
        const updated = yield* zeroTrust.updateDevicePosture({
            accountId,
            ruleId: observed.id,
            name,
            type: news.type,
            description: news.description,
            schedule: news.schedule,
            expiration: news.expiration,
            match: news.match,
            input: news.input,
        });
        return toAttributes(updated, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        // Cloudflare's delete is already idempotent (200 on a missing
        // rule); the typed catch covers the documented 404 path too.
        yield* zeroTrust
            .deleteDevicePosture({
            accountId: output.accountId,
            ruleId: output.postureRuleId,
        })
            .pipe(Effect.catchTag("PostureRuleNotFound", () => Effect.void));
    }),
});
/**
 * Read a posture rule by id, mapping "gone" (`PostureRuleNotFound`,
 * Cloudflare error code 6024) to `undefined`.
 */
const observeRule = (accountId, ruleId) => zeroTrust
    .getDevicePosture({ accountId, ruleId })
    .pipe(Effect.catchTag("PostureRuleNotFound", () => Effect.succeed(undefined)));
/**
 * Find a posture rule by exact name (oldest-id-first for determinism when
 * names collide).
 */
const findByName = (accountId, name) => zeroTrust.listDevicePostures.items({ accountId }).pipe(Stream.filter((r) => r.name === name && r.id != null), Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""))
    .at(0)));
const createRuleName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const toAttributes = (rule, accountId) => ({
    postureRuleId: rule.id ?? "",
    accountId,
    name: rule.name ?? "",
    type: rule.type ?? "",
    description: denull(rule.description),
    schedule: denull(rule.schedule),
    expiration: denull(rule.expiration),
    match: normalizeMatch(rule.match),
    input: denull(rule.input),
});
const normalizeMatch = (match) => match == null
    ? undefined
    : match.map((m) => ({ platform: denull(m.platform) }));
/**
 * Strip Cloudflare's `null` echoes to `undefined` so structural equality
 * (`JSON.stringify`) works.
 */
const denull = (v) => v == null ? undefined : v;
/** Structural deep-equality via canonical JSON. */
const sameJSON = (a, b) => JSON.stringify(a) === JSON.stringify(b);
//# sourceMappingURL=PostureRule.js.map