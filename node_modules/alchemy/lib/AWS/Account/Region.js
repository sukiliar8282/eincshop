import * as account from "@distilled.cloud/aws/account";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
const isEnabledStatus = (status) => status === "ENABLED" || status === "ENABLED_BY_DEFAULT";
const isTerminalStatus = (status) => status !== "ENABLING" && status !== "DISABLING";
/**
 * The opt-in status of an AWS Region for an account. Opt-in Regions (e.g.
 * `ap-east-1`, `me-south-1`) are disabled by default and must be enabled
 * before use; this resource drives `account:EnableRegion` /
 * `account:DisableRegion` to converge the Region to the desired status.
 *
 * Enabling or disabling a Region is asynchronous and can take several
 * minutes; reconcile waits (bounded) for the transition to settle and records
 * the observed status either way. Disabling a Region removes all IAM access
 * to resources in it, so destroying this resource intentionally does NOT
 * disable the Region — it only stops managing it (set `enabled: false`
 * explicitly to opt out).
 *
 * ### Managing Region Opt-In
 * **Example:** Enable an Opt-In Region
 * ```typescript
 * const region = yield* Account.Region("HongKong", {
 *   regionName: "ap-east-1",
 *   enabled: true,
 * });
 * ```
 *
 * **Example:** Track a Default Region
 * ```typescript
 * const region = yield* Account.Region("UsEast1", {
 *   regionName: "us-east-1",
 *   enabled: true, // ENABLED_BY_DEFAULT — reconcile makes no API mutation
 * });
 * ```
 *
 * **Example:** Opt Out of a Region
 * ```typescript
 * const region = yield* Account.Region("HongKong", {
 *   regionName: "ap-east-1",
 *   enabled: false,
 * });
 * ```
 *
 * @resource
 */
export const Region = Resource("AWS.Account.Region");
export const RegionProvider = () => Provider.effect(Region, Effect.gen(function* () {
    const observe = (regionName, accountId) => account
        .getRegionOptStatus({ RegionName: regionName, AccountId: accountId })
        .pipe(Effect.map((r) => r.RegionOptStatus));
    // Region opt-in/out is asynchronous (typically a few minutes). Wait,
    // bounded, for an in-flight transition to settle; if it is still
    // transitioning after the budget, return the transitional status —
    // re-running reconcile converges.
    const settle = (regionName, accountId) => observe(regionName, accountId).pipe(Effect.repeat({
        schedule: Schedule.spaced("10 seconds"),
        until: (status) => isTerminalStatus(status),
        times: 24,
    }));
    const toAttributes = (regionName, status) => ({
        regionName,
        enabled: isEnabledStatus(status),
        regionOptStatus: status ?? "DISABLED",
    });
    return {
        // Disabling a Region removes IAM access to everything in it — far too
        // destructive for an automatic nuke of an account-global setting.
        nuke: { skip: true },
        stables: [],
        // The Region name is the identity of this account-global slot, so a
        // different Region (or target account) replaces the resource.
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return;
            if ((olds?.regionName ?? news.regionName) !== news.regionName ||
                (olds?.accountId ?? news.accountId) !== news.accountId) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const regionName = output?.regionName ?? olds?.regionName;
            if (!regionName)
                return undefined;
            const status = yield* observe(regionName, olds?.accountId);
            return toAttributes(regionName, status);
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            let status = yield* settle(news.regionName, news.accountId);
            if (news.enabled && status === "DISABLED") {
                yield* account
                    .enableRegion({
                    RegionName: news.regionName,
                    AccountId: news.accountId,
                })
                    .pipe(
                // A concurrent transition already in flight — settle below
                // observes whatever it converges to.
                Effect.catchTag("ConflictException", () => Effect.void));
                status = yield* settle(news.regionName, news.accountId);
            }
            else if (!news.enabled && isEnabledStatus(status)) {
                // Disabling an ENABLED_BY_DEFAULT Region is rejected by AWS with
                // a typed ValidationException — let it propagate.
                yield* account
                    .disableRegion({
                    RegionName: news.regionName,
                    AccountId: news.accountId,
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.void));
                status = yield* settle(news.regionName, news.accountId);
            }
            yield* session.note(`${news.regionName}:${status ?? "UNKNOWN"}`);
            return toAttributes(news.regionName, status);
        }),
        // Enumerate the opt-in Regions (every status except
        // ENABLED_BY_DEFAULT — default Regions are not manageable slots).
        list: () => account.listRegions
            .items({
            RegionOptStatusContains: [
                "ENABLED",
                "ENABLING",
                "DISABLING",
                "DISABLED",
            ],
        })
            .pipe(Stream.runCollect, Effect.map((regions) => Array.from(regions)
            .filter((region) => region.RegionName != null)
            .map((region) => toAttributes(region.RegionName, region.RegionOptStatus)))),
        // Destroy intentionally leaves the Region's opt-in status untouched:
        // disabling a Region removes IAM access to all resources in it. Users
        // opt out explicitly with `enabled: false` before removing the
        // resource if that is what they want.
        delete: Effect.fn(function* () { }),
    };
}));
//# sourceMappingURL=Region.js.map