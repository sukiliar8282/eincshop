import * as databrew from "@distilled.cloud/aws/databrew";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { cleanMap, databrewArn, fetchObservedTags, syncTags, } from "./internal.js";
/**
 * An AWS Glue DataBrew ruleset — a set of data-quality rules bound to a
 * dataset. Attach it to a profile job via `validationConfigurations` to
 * produce pass/fail validation results alongside the data profile.
 * ### Creating Rulesets
 * **Example:** Data-Quality Rules for a Dataset
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const ruleset = yield* AWS.DataBrew.Ruleset("Quality", {
 *   targetArn: dataset.datasetArn,
 *   rules: [
 *     {
 *       name: "no-missing-ids",
 *       checkExpression: "AGG(MISSING_VALUES_PERCENTAGE) == :val1",
 *       substitutionMap: { ":val1": "0" },
 *       columnSelectors: [{ name: "id" }],
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Validate in a Profile Job
 * ```typescript
 * const profile = yield* AWS.DataBrew.Job("Profile", {
 *   type: "PROFILE",
 *   datasetName: dataset.datasetName,
 *   role: role.roleArn,
 *   outputLocation: { bucket: bucket.bucketName, key: "profiles/" },
 *   validationConfigurations: [{ rulesetArn: ruleset.rulesetArn }],
 * });
 * ```
 *
 * @resource
 */
export const Ruleset = Resource("AWS.DataBrew.Ruleset");
const buildRules = (rules) => rules.map((rule) => ({
    Name: rule.name,
    Disabled: rule.disabled,
    CheckExpression: rule.checkExpression,
    SubstitutionMap: rule.substitutionMap,
    Threshold: rule.threshold
        ? {
            Value: rule.threshold.value,
            Type: rule.threshold.type,
            Unit: rule.threshold.unit,
        }
        : undefined,
    ColumnSelectors: rule.columnSelectors?.map((s) => ({
        Regex: s.regex,
        Name: s.name,
    })),
}));
export const RulesetProvider = () => Provider.effect(Ruleset, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.rulesetName ??
            (yield* createPhysicalName({ id, maxLength: 255 })));
    });
    const observe = Effect.fn(function* (name) {
        return yield* databrew
            .describeRuleset({ Name: name })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return Ruleset.Provider.of({
        stables: ["rulesetName", "rulesetArn", "targetArn"],
        list: () => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            const pages = yield* databrew.listRulesets
                .pages({})
                .pipe(Stream.runCollect);
            return Array.from(pages)
                .flatMap((page) => page.Rulesets ?? [])
                .map((r) => ({
                rulesetName: r.Name,
                rulesetArn: r.ResourceArn ??
                    databrewArn(region, accountId, "ruleset", r.Name),
                targetArn: r.TargetArn ?? "",
            }));
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.rulesetName ?? (yield* createName(id, olds ?? {}));
            const ruleset = yield* observe(name);
            if (ruleset === undefined)
                return undefined;
            const arn = ruleset.ResourceArn ??
                databrewArn(region, accountId, "ruleset", name);
            const attrs = {
                rulesetName: name,
                rulesetArn: arn,
                targetArn: ruleset.TargetArn ?? "",
            };
            const tags = cleanMap(ruleset.Tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
            // UpdateRuleset only accepts Description + Rules.
            if (olds.targetArn !== news.targetArn) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.rulesetName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE
            const ruleset = yield* observe(name);
            // 2. ENSURE / 3. SYNC — UpdateRuleset is a full PUT of the rules
            if (ruleset === undefined) {
                yield* databrew
                    .createRuleset({
                    Name: name,
                    Description: news.description,
                    TargetArn: news.targetArn,
                    Rules: buildRules(news.rules),
                    Tags: desiredTags,
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.void));
            }
            else {
                yield* databrew.updateRuleset({
                    Name: name,
                    Description: news.description,
                    Rules: buildRules(news.rules),
                });
            }
            const arn = ruleset?.ResourceArn ??
                databrewArn(region, accountId, "ruleset", name);
            // 3b. SYNC TAGS against observed cloud tags
            const observedTags = yield* fetchObservedTags(arn);
            yield* syncTags(arn, observedTags, desiredTags);
            yield* session.note(name);
            return {
                rulesetName: name,
                rulesetArn: arn,
                targetArn: news.targetArn,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* databrew
                .deleteRuleset({ Name: output.rulesetName })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Ruleset.js.map