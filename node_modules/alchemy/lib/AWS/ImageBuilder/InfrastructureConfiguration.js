import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { driftedFrom, imageBuilderArn, retryWhileDependedOn, syncImageBuilderTags, toTagRecord, } from "./internal.js";
/**
 * An EC2 Image Builder infrastructure configuration — the environment
 * (instance profile, instance types, network, logging) in which images are
 * built and tested.
 * ### Creating an Infrastructure Configuration
 * **Example:** Minimal Configuration
 * ```typescript
 * const role = yield* IAM.Role("BuilderRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "ec2.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 *   managedPolicyArns: [
 *     "arn:aws:iam::aws:policy/EC2InstanceProfileForImageBuilder",
 *     "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
 *   ],
 * });
 * const profile = yield* IAM.InstanceProfile("BuilderProfile", {
 *   roleName: role.roleName,
 * });
 * const infra = yield* ImageBuilder.InfrastructureConfiguration("Infra", {
 *   instanceProfileName: profile.instanceProfileName,
 *   instanceTypes: ["t3.micro"],
 *   terminateInstanceOnFailure: true,
 * });
 * ```
 *
 * @resource
 */
export const InfrastructureConfiguration = Resource("AWS.ImageBuilder.InfrastructureConfiguration");
/**
 * A freshly created IAM instance profile takes a few seconds to become
 * visible to Image Builder, which rejects it with
 * `InvalidParameterValueException` ("The provided instance profile does not
 * exist") in the interim — retry through the propagation window (bounded).
 */
const retryThroughIamPropagation = (self) => Effect.retry(self, {
    while: (e) => e._tag === "InvalidParameterValueException" &&
        (e.message?.includes("instance profile does not exist") ?? false),
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(10)]),
});
export const InfrastructureConfigurationProvider = () => Provider.effect(InfrastructureConfiguration, Effect.gen(function* () {
    const toName = (id, props) => props.infrastructureConfigurationName
        ? Effect.succeed(props.infrastructureConfigurationName)
        : createPhysicalName({ id, maxLength: 126 });
    const toArn = (name) => imageBuilderArn("infrastructure-configuration", name);
    const getConfiguration = Effect.fn(function* (arn) {
        const response = yield* imagebuilder
            .getInfrastructureConfiguration({
            infrastructureConfigurationArn: arn,
        })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.infrastructureConfiguration;
    });
    const toAttrs = Effect.fn(function* (config) {
        if (!config.arn || !config.name) {
            return yield* Effect.fail(new Error("Image Builder infrastructure configuration is missing its ARN or name"));
        }
        return {
            infrastructureConfigurationName: config.name,
            infrastructureConfigurationArn: config.arn,
            instanceProfileName: config.instanceProfileName,
            dateCreated: config.dateCreated,
        };
    });
    /**
     * Mutable aspects synced by a full-PUT update. Keys of both the
     * observed struct and the Props (they share names).
     */
    const mutableKeys = [
        "description",
        "instanceTypes",
        "instanceProfileName",
        "securityGroupIds",
        "subnetId",
        "logging",
        "keyPair",
        "terminateInstanceOnFailure",
        "snsTopicArn",
        "resourceTags",
        "instanceMetadataOptions",
        "placement",
    ];
    return {
        stables: [
            "infrastructureConfigurationName",
            "infrastructureConfigurationArn",
        ],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds)) !== (yield* toName(id, news))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const arn = output?.infrastructureConfigurationArn ??
                (yield* toArn(yield* toName(id, olds)));
            const config = yield* getConfiguration(arn);
            if (config === undefined)
                return undefined;
            const attrs = yield* toAttrs(config);
            const tags = toTagRecord(config.tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, olds, output, session }) {
            // One idempotency token per reconcile — retries within this run
            // are deduplicated by the API.
            const clientToken = yield* Effect.sync(() => crypto.randomUUID());
            const name = output?.infrastructureConfigurationName ??
                (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — the configuration ARN is deterministic from the
            //    name; cloud state is authoritative.
            const arn = output?.infrastructureConfigurationArn ?? (yield* toArn(name));
            let observed = yield* getConfiguration(arn);
            // 2. Ensure — create if missing; tolerate an AlreadyExists race
            //    by re-observing.
            if (observed === undefined) {
                const created = yield* retryThroughIamPropagation(imagebuilder.createInfrastructureConfiguration({
                    name,
                    description: news.description,
                    instanceTypes: news.instanceTypes,
                    instanceProfileName: news.instanceProfileName,
                    securityGroupIds: news.securityGroupIds,
                    subnetId: news.subnetId,
                    logging: news.logging,
                    keyPair: news.keyPair,
                    terminateInstanceOnFailure: news.terminateInstanceOnFailure,
                    snsTopicArn: news.snsTopicArn,
                    resourceTags: news.resourceTags,
                    instanceMetadataOptions: news.instanceMetadataOptions,
                    placement: news.placement,
                    tags: desiredTags,
                    clientToken,
                })).pipe(Effect.catchTag("ResourceAlreadyExistsException", () => Effect.succeed(undefined)));
                observed = yield* getConfiguration(created?.infrastructureConfigurationArn ?? arn);
                if (observed === undefined) {
                    return yield* Effect.fail(new Error(`created Image Builder infrastructure configuration '${name}' is not readable`));
                }
            }
            // 3. Sync — compare OBSERVED cloud state against the desired
            //    props; a full-PUT update converges any drift (including
            //    props the user removed since the last deploy — `olds` is
            //    only a hint for removals).
            const drifted = mutableKeys.some((key) => driftedFrom(observed?.[key], news[key]) ||
                (news[key] === undefined && olds?.[key] !== undefined));
            if (drifted && observed.arn) {
                yield* imagebuilder.updateInfrastructureConfiguration({
                    infrastructureConfigurationArn: observed.arn,
                    description: news.description,
                    instanceTypes: news.instanceTypes,
                    instanceProfileName: news.instanceProfileName,
                    securityGroupIds: news.securityGroupIds,
                    subnetId: news.subnetId,
                    logging: news.logging,
                    keyPair: news.keyPair,
                    terminateInstanceOnFailure: news.terminateInstanceOnFailure,
                    snsTopicArn: news.snsTopicArn,
                    resourceTags: news.resourceTags,
                    instanceMetadataOptions: news.instanceMetadataOptions,
                    placement: news.placement,
                    clientToken,
                });
                observed = (yield* getConfiguration(observed.arn)) ?? observed;
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            if (observed.arn) {
                yield* syncImageBuilderTags(observed.arn, desiredTags);
            }
            // 4. Return fresh attributes.
            yield* session.note(name);
            return yield* toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryWhileDependedOn(imagebuilder.deleteInfrastructureConfiguration({
                infrastructureConfigurationArn: output.infrastructureConfigurationArn,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
        list: () => imagebuilder.listInfrastructureConfigurations.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.infrastructureConfigurationSummaryList ?? []).filter((summary) => summary.arn !== undefined && summary.name !== undefined))), Effect.map((summaries) => summaries.map((summary) => ({
            infrastructureConfigurationName: summary.name,
            infrastructureConfigurationArn: summary.arn,
            instanceProfileName: summary.instanceProfileName,
            dateCreated: summary.dateCreated,
        })))),
    };
}));
//# sourceMappingURL=InfrastructureConfiguration.js.map