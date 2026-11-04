import * as xray from "@distilled.cloud/aws/xray";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags, hasAlchemyTags, } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * An AWS X-Ray sampling rule that controls which requests are recorded as
 * traces by instrumented applications.
 *
 * X-Ray evaluates sampling rules in ascending priority order for each
 * request. The first matching rule borrows from its reservoir, then applies
 * the fixed rate.
 * ### Creating Sampling Rules
 * **Example:** Sample all requests to a service
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * const rule = yield* XRay.SamplingRule("SampleEverything", {
 *   priority: 100,
 *   fixedRate: 1.0,
 *   reservoirSize: 5,
 *   serviceName: "my-api-*",
 * });
 * ```
 *
 * **Example:** Low-rate sampling for a noisy endpoint
 * ```typescript
 * const rule = yield* XRay.SamplingRule("HealthChecks", {
 *   priority: 10,
 *   fixedRate: 0.01,
 *   urlPath: "/health",
 *   httpMethod: "GET",
 * });
 * ```
 *
 * **Example:** Match on segment attributes
 * ```typescript
 * const rule = yield* XRay.SamplingRule("PremiumTenants", {
 *   priority: 50,
 *   fixedRate: 0.5,
 *   reservoirSize: 1,
 *   attributes: { tier: "premium" },
 * });
 * ```
 *
 * @resource
 */
export const SamplingRule = Resource("AWS.XRay.SamplingRule");
/**
 * Raised when a `SamplingRule` is configured with the reserved rule name
 * `Default`, which X-Ray uses for the built-in fallback rule.
 */
export class XRayReservedRuleName extends Data.TaggedError("XRayReservedRuleName") {
}
const validateRuleName = (props) => props.ruleName === "Default"
    ? Effect.fail(new XRayReservedRuleName({
        message: '"Default" is reserved for the built-in X-Ray fallback sampling rule — choose another ruleName.',
    }))
    : Effect.void;
const shallowRecordEqual = (a, b) => {
    const aKeys = Object.keys(a).filter((k) => a[k] !== undefined);
    const bKeys = Object.keys(b).filter((k) => b[k] !== undefined);
    return (aKeys.length === bKeys.length && aKeys.every((key) => a[key] === b[key]));
};
export const SamplingRuleProvider = () => Provider.effect(SamplingRule, Effect.gen(function* () {
    const createRuleName = Effect.fn(function* (id, props) {
        // X-Ray rule names are limited to 32 characters.
        return (props.ruleName ?? (yield* createPhysicalName({ id, maxLength: 32 })));
    });
    // The desired wire shape for both create and update, derived purely
    // from the new props.
    const desiredRule = (name, props) => ({
        RuleName: name,
        ResourceARN: props.resourceArn ?? "*",
        Priority: props.priority,
        FixedRate: props.fixedRate,
        ReservoirSize: props.reservoirSize ?? 0,
        ServiceName: props.serviceName ?? "*",
        ServiceType: props.serviceType ?? "*",
        Host: props.host ?? "*",
        HTTPMethod: props.httpMethod ?? "*",
        URLPath: props.urlPath ?? "*",
        Attributes: props.attributes ?? {},
    });
    // X-Ray has no GetSamplingRule — observe by enumerating the (small)
    // rule list and matching on the deterministic rule name.
    const observeRule = (name) => xray.getSamplingRules.items({}).pipe(Stream.filter((record) => record.SamplingRule?.RuleName === name), Stream.runHead, Effect.map((record) => Option.getOrUndefined(record)?.SamplingRule));
    const observedTags = (ruleArn) => xray.listTagsForResource.items({ ResourceARN: ruleArn }).pipe(Stream.runCollect, Effect.map((chunk) => Object.fromEntries(Array.from(chunk).map((t) => [t.Key, t.Value]))), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({})));
    return SamplingRule.Provider.of({
        stables: ["ruleName", "ruleArn"],
        list: () => Effect.gen(function* () {
            const records = yield* xray.getSamplingRules
                .items({})
                .pipe(Stream.runCollect);
            return Array.from(records).flatMap((record) => record.SamplingRule?.RuleName &&
                record.SamplingRule.RuleARN &&
                // The built-in `Default` sampling rule always exists and can
                // never be deleted — keep it out of enumeration for
                // account-wide teardown (nuke).
                record.SamplingRule.RuleName !== "Default"
                ? [
                    {
                        ruleName: record.SamplingRule.RuleName,
                        ruleArn: record.SamplingRule.RuleARN,
                    },
                ]
                : []);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const ruleName = output?.ruleName ?? (yield* createRuleName(id, olds ?? {}));
            const found = yield* observeRule(ruleName);
            if (!found?.RuleARN)
                return undefined;
            const attrs = { ruleName, ruleArn: found.RuleARN };
            const tags = yield* observedTags(found.RuleARN);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            yield* validateRuleName(news ?? {});
            const oldName = yield* createRuleName(id, olds ?? {});
            const newName = yield* createRuleName(id, news ?? {});
            if (oldName !== newName) {
                return { action: "replace" };
            }
            // fall through: engine default update logic for mutable fields
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            yield* validateRuleName(news);
            const ruleName = output?.ruleName ?? (yield* createRuleName(id, news));
            const desired = desiredRule(ruleName, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE — the rule list is authoritative; output is only a
            //    cached identifier.
            let live = yield* observeRule(ruleName);
            // 2. ENSURE — create when missing; a concurrent create surfaces as
            //    the typed SamplingRuleAlreadyExists tag, which we treat as a
            //    race and re-observe.
            if (live === undefined) {
                live = yield* xray
                    .createSamplingRule({
                    SamplingRule: { ...desired, Version: 1 },
                    Tags: createTagsList(desiredTags),
                })
                    .pipe(Effect.map((r) => r.SamplingRuleRecord?.SamplingRule), Effect.catchTag("SamplingRuleAlreadyExists", () => observeRule(ruleName)));
            }
            // 3. SYNC — diff every mutable field of the OBSERVED rule against
            //    the desired shape; a single UpdateSamplingRule applies the
            //    full desired state only when something actually drifted.
            const inSync = live !== undefined &&
                live.ResourceARN === desired.ResourceARN &&
                live.Priority === desired.Priority &&
                live.FixedRate === desired.FixedRate &&
                live.ReservoirSize === desired.ReservoirSize &&
                live.ServiceName === desired.ServiceName &&
                live.ServiceType === desired.ServiceType &&
                live.Host === desired.Host &&
                live.HTTPMethod === desired.HTTPMethod &&
                live.URLPath === desired.URLPath &&
                shallowRecordEqual(live.Attributes ?? {}, desired.Attributes);
            if (!inSync) {
                live = yield* xray
                    .updateSamplingRule({ SamplingRuleUpdate: desired })
                    .pipe(Effect.map((r) => r.SamplingRuleRecord?.SamplingRule));
            }
            // The ARN shape is deterministic:
            // arn:aws:xray:{region}:{account}:sampling-rule/{name}
            const { accountId, region } = yield* AWSEnvironment.current;
            const ruleArn = live?.RuleARN ??
                `arn:aws:xray:${region}:${accountId}:sampling-rule/${ruleName}`;
            // 3b. SYNC TAGS — diff against OBSERVED cloud tags so adoption
            //     converges (create-time Tags only apply on first create).
            const currentTags = yield* observedTags(ruleArn);
            const { upsert, removed } = diffTags(currentTags, desiredTags);
            if (upsert.length > 0) {
                yield* xray.tagResource({ ResourceARN: ruleArn, Tags: upsert });
            }
            if (removed.length > 0) {
                yield* xray.untagResource({
                    ResourceARN: ruleArn,
                    TagKeys: removed,
                });
            }
            yield* session.note(ruleName);
            return { ruleName, ruleArn };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* xray.deleteSamplingRule({ RuleName: output.ruleName }).pipe(
            // Typed synthetic tag for a missing rule — idempotent delete.
            Effect.catchTag("SamplingRuleNotFound", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=SamplingRule.js.map