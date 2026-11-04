import * as wafv2 from "@distilled.cloud/aws/wafv2";
import * as Effect from "effect/Effect";
import { Unowned } from "../../AdoptPolicy.js";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, hasAlchemyTags, } from "../../Tags.js";
import { fetchWafTags, retryAssociatedItem, retryOptimisticLock, syncWafTags, withWafScope, } from "./internal.js";
/**
 * An AWS WAFv2 IP set — a named collection of IP addresses and CIDR ranges
 * referenced from web ACL and rule group rules via
 * `IPSetReferenceStatement`.
 *
 * ### Creating IP Sets
 * **Example:** Block List of IPv4 Addresses
 * ```typescript
 * const blockList = yield* AWS.WAFv2.IPSet("BlockList", {
 *   addresses: ["192.0.2.44/32", "203.0.113.0/24"],
 * });
 * ```
 *
 * **Example:** Reference from a Web ACL Rule
 * ```typescript
 * const acl = yield* AWS.WAFv2.WebACL("Firewall", {
 *   rules: [
 *     {
 *       Name: "block-bad-ips",
 *       Priority: 0,
 *       Statement: {
 *         IPSetReferenceStatement: { ARN: blockList.ipSetArn },
 *       },
 *       Action: { Block: {} },
 *       VisibilityConfig: {
 *         SampledRequestsEnabled: true,
 *         CloudWatchMetricsEnabled: true,
 *         MetricName: "block-bad-ips",
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const IPSet = Resource("AWS.WAFv2.IPSet");
const defaultScope = "REGIONAL";
const defaultIpVersion = "IPV4";
const sortedAddresses = (addresses) => [...addresses].sort((a, b) => a.localeCompare(b));
const toAttrs = (ipSet, scope) => ({
    ipSetName: ipSet.Name,
    ipSetId: ipSet.Id,
    ipSetArn: ipSet.ARN,
    scope,
    ipAddressVersion: ipSet.IPAddressVersion,
    addresses: [...ipSet.Addresses],
});
export const IPSetProvider = () => Provider.effect(IPSet, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.ipSetName ?? (yield* createPhysicalName({ id, maxLength: 128 })));
    });
    const findIPSet = Effect.fn(function* (scope, name, cachedId) {
        if (cachedId !== undefined) {
            const byId = yield* withWafScope(scope, wafv2
                .getIPSet({ Name: name, Scope: scope, Id: cachedId })
                .pipe(Effect.catchTag("WAFNonexistentItemException", () => Effect.succeed(undefined))));
            if (byId?.IPSet) {
                return byId;
            }
        }
        let marker;
        for (let page = 0; page < 20; page++) {
            const listed = yield* withWafScope(scope, wafv2.listIPSets({ Scope: scope, NextMarker: marker, Limit: 100 }));
            const summary = listed.IPSets?.find((s) => s.Name === name);
            if (summary?.Id !== undefined) {
                return yield* withWafScope(scope, wafv2
                    .getIPSet({ Name: name, Scope: scope, Id: summary.Id })
                    .pipe(Effect.catchTag("WAFNonexistentItemException", () => Effect.succeed(undefined))));
            }
            if (!listed.NextMarker || (listed.IPSets?.length ?? 0) === 0) {
                break;
            }
            marker = listed.NextMarker;
        }
        return undefined;
    });
    const listScope = Effect.fn(function* (scope) {
        const rows = [];
        let marker;
        for (let page = 0; page < 50; page++) {
            const listed = yield* withWafScope(scope, wafv2.listIPSets({ Scope: scope, NextMarker: marker, Limit: 100 }));
            const summaries = listed.IPSets ?? [];
            const details = yield* Effect.forEach(summaries, (summary) => summary.Name !== undefined && summary.Id !== undefined
                ? withWafScope(scope, wafv2
                    .getIPSet({
                    Name: summary.Name,
                    Scope: scope,
                    Id: summary.Id,
                })
                    .pipe(Effect.catchTag("WAFNonexistentItemException", () => Effect.succeed(undefined))))
                : Effect.succeed(undefined), { concurrency: 5 });
            for (const detail of details) {
                if (detail?.IPSet) {
                    rows.push(toAttrs(detail.IPSet, scope));
                }
            }
            if (!listed.NextMarker || summaries.length === 0) {
                break;
            }
            marker = listed.NextMarker;
        }
        return rows;
    });
    return {
        stables: [
            "ipSetName",
            "ipSetId",
            "ipSetArn",
            "scope",
            "ipAddressVersion",
        ],
        list: () => Effect.gen(function* () {
            const regional = yield* listScope("REGIONAL");
            const cloudfront = yield* listScope("CLOUDFRONT");
            return [...regional, ...cloudfront];
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds ?? { addresses: [] });
            const newName = yield* createName(id, news);
            if (oldName !== newName ||
                (olds?.scope ?? defaultScope) !== (news.scope ?? defaultScope) ||
                (olds?.ipAddressVersion ?? defaultIpVersion) !==
                    (news.ipAddressVersion ?? defaultIpVersion)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const scope = output?.scope ?? olds?.scope ?? defaultScope;
            const name = output?.ipSetName ??
                (yield* createName(id, olds ?? { addresses: [] }));
            const found = yield* findIPSet(scope, name, output?.ipSetId);
            if (!found?.IPSet) {
                return undefined;
            }
            const attrs = toAttrs(found.IPSet, scope);
            const tags = yield* fetchWafTags(scope, found.IPSet.ARN);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const scope = news.scope ?? defaultScope;
            const name = output?.ipSetName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. Observe.
            let observed = yield* findIPSet(scope, name, output?.ipSetId);
            // 2. Ensure — tolerate a duplicate-create race and re-read.
            if (!observed?.IPSet) {
                yield* withWafScope(scope, wafv2
                    .createIPSet({
                    Name: name,
                    Scope: scope,
                    IPAddressVersion: news.ipAddressVersion ?? defaultIpVersion,
                    Addresses: news.addresses,
                    Description: news.description,
                    Tags: createTagsList(desiredTags),
                })
                    .pipe(Effect.catchTag("WAFDuplicateItemException", () => Effect.succeed(undefined))));
                observed = yield* findIPSet(scope, name, undefined);
            }
            if (!observed?.IPSet) {
                return yield* Effect.fail(new Error(`Failed to observe IPSet '${name}' after create`));
            }
            const ipSet = observed.IPSet;
            yield* session.note(ipSet.ARN);
            // 3. Sync addresses + description against OBSERVED state. WAF
            //    returns addresses in arbitrary order — compare as sets.
            const drifted = !deepEqual({
                Addresses: sortedAddresses(ipSet.Addresses),
                Description: ipSet.Description,
            }, {
                Addresses: sortedAddresses(news.addresses),
                Description: news.description,
            }, { stripNullish: true });
            if (drifted) {
                yield* retryOptimisticLock(Effect.gen(function* () {
                    const fresh = yield* findIPSet(scope, name, ipSet.Id);
                    if (!fresh?.IPSet || fresh.LockToken === undefined) {
                        return;
                    }
                    yield* withWafScope(scope, wafv2.updateIPSet({
                        Name: name,
                        Scope: scope,
                        Id: fresh.IPSet.Id,
                        Addresses: news.addresses,
                        Description: news.description,
                        LockToken: fresh.LockToken,
                    }));
                }));
            }
            // 3b. Sync tags against OBSERVED cloud tags.
            yield* syncWafTags(scope, ipSet.ARN, desiredTags);
            // 4. Return fresh attributes.
            return {
                ...toAttrs(ipSet, scope),
                addresses: [...news.addresses],
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            const scope = output.scope;
            // An IP set still referenced by a web ACL rule (deletion
            // propagation) surfaces WAFAssociatedItemException — retry it.
            yield* retryAssociatedItem(retryOptimisticLock(Effect.gen(function* () {
                const found = yield* withWafScope(scope, wafv2
                    .getIPSet({
                    Name: output.ipSetName,
                    Scope: scope,
                    Id: output.ipSetId,
                })
                    .pipe(Effect.catchTag("WAFNonexistentItemException", () => Effect.succeed(undefined))));
                if (!found?.IPSet || found.LockToken === undefined) {
                    return;
                }
                yield* withWafScope(scope, wafv2
                    .deleteIPSet({
                    Name: output.ipSetName,
                    Scope: scope,
                    Id: output.ipSetId,
                    LockToken: found.LockToken,
                })
                    .pipe(Effect.catchTag("WAFNonexistentItemException", () => Effect.void)));
            })));
        }),
    };
}));
//# sourceMappingURL=IPSet.js.map