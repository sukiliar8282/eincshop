import { Region } from "@distilled.cloud/aws/Region";
import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Stream from "effect/Stream";
import * as Bundle from "../../Bundle/Bundle.js";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import { Platform } from "../../Platform.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { Stack } from "../../Stack.js";
import { Stage } from "../../Stage.js";
import { createInternalTags, diffTags, hasTags } from "../../Tags.js";
import { createEc2HostRuntimeContext, createEc2HostedSupport, } from "../EC2/hosted.js";
import { AWSEnvironment } from "../index.js";
/**
 * A launch template that preserves the `Host` authoring model used by
 * `AWS.EC2.Instance`, but packages that host configuration for use with an
 * Auto Scaling Group.
 * ### Creating a Launch Template
 * **Example:** Basic Launch Template
 * ```typescript
 * import { LaunchTemplate } from "alchemy/AWS/AutoScaling";
 *
 * const template = yield* LaunchTemplate("Template", {
 *   imageId: "ami-0abcdef1234567890",
 *   instanceType: "t3.micro",
 * });
 * ```
 *
 * **Example:** Launch a fleet from the template
 * ```typescript
 * import { AutoScalingGroup } from "alchemy/AWS/AutoScaling";
 *
 * const group = yield* AutoScalingGroup("Fleet", {
 *   launchTemplate: template,
 *   subnetIds: [subnet.subnetId],
 *   minSize: 1,
 *   maxSize: 3,
 * });
 * ```
 *
 * ### Hosting Processes
 * **Example:** Hosted HTTP Launch Template
 * ```typescript
 * const template = yield* Effect.gen(function* () {
 *   yield* Http.serve(HttpServerResponse.json({ ok: true }));
 *
 *   return {
 *     main: import.meta.url,
 *     imageId,
 *     instanceType: "t3.small",
 *     securityGroupIds: [securityGroup.groupId],
 *     port: 3000,
 *   };
 * }).pipe(
 *   Effect.provide(AWS.EC2.HttpServer),
 *   AWS.AutoScaling.LaunchTemplate("ApiTemplate"),
 * );
 * ```
 *
 * @resource
 */
export const LaunchTemplate = Platform("AWS.AutoScaling.LaunchTemplate", {
    createRuntimeContext: createEc2HostRuntimeContext("AWS.AutoScaling.LaunchTemplate"),
});
export const LaunchTemplateProvider = () => Provider.effect(LaunchTemplate, Effect.gen(function* () {
    const stack = yield* Stack;
    const stage = yield* Stage;
    const fs = yield* FileSystem.FileSystem;
    const virtualEntryPlugin = yield* Bundle.virtualEntryPlugin;
    const hosted = createEc2HostedSupport({
        stackName: stack.name,
        stage,
        fs,
        virtualEntryPlugin,
        resourceType: "AWS.AutoScaling.LaunchTemplate",
    });
    const toName = (id, props = {}) => props.launchTemplateName
        ? Effect.succeed(props.launchTemplateName)
        : createPhysicalName({ id, maxLength: 128, lowercase: true });
    const toArn = (launchTemplateId) => AWSEnvironment.current.pipe(Effect.map((env) => `arn:aws:ec2:${env.region}:${env.accountId}:launch-template/${launchTemplateId}`));
    const describeById = (launchTemplateId) => ec2
        .describeLaunchTemplates({
        LaunchTemplateIds: [launchTemplateId],
    })
        .pipe(Effect.map((result) => result.LaunchTemplates?.[0]), Effect.catch((error) => isLaunchTemplateNotFound(error)
        ? Effect.succeed(undefined)
        : Effect.fail(error)));
    const describeByName = (launchTemplateName) => ec2
        .describeLaunchTemplates({
        LaunchTemplateNames: [launchTemplateName],
    })
        .pipe(Effect.map((result) => result.LaunchTemplates?.[0]), Effect.catch((error) => isLaunchTemplateNotFound(error)
        ? Effect.succeed(undefined)
        : Effect.fail(error)));
    const syncTemplateTags = Effect.fn(function* ({ launchTemplateId, oldTags, newTags, }) {
        const { removed, upsert } = diffTags(oldTags, newTags);
        if (removed.length > 0) {
            yield* ec2.deleteTags({
                Resources: [launchTemplateId],
                Tags: removed.map((key) => ({ Key: key })),
            });
        }
        if (upsert.length > 0) {
            yield* ec2.createTags({
                Resources: [launchTemplateId],
                Tags: upsert,
            });
        }
    });
    const createVersion = Effect.fn(function* ({ launchTemplateId, news, runtime, }) {
        const created = yield* ec2.createLaunchTemplateVersion({
            LaunchTemplateId: launchTemplateId,
            VersionDescription: runtime.code?.hash ?? "alchemy-update",
            LaunchTemplateData: hosted.buildLaunchTemplateData({
                imageId: news.imageId,
                instanceType: news.instanceType,
                keyName: news.keyName,
                securityGroupIds: news.securityGroupIds,
                associatePublicIpAddress: news.associatePublicIpAddress,
                tags: news.tags,
            }, runtime),
        });
        const versionNumber = created.LaunchTemplateVersion?.VersionNumber;
        if (versionNumber === undefined) {
            return yield* Effect.fail(new Error(`createLaunchTemplateVersion returned no version for '${launchTemplateId}'`));
        }
        yield* ec2.modifyLaunchTemplate({
            LaunchTemplateId: launchTemplateId,
            DefaultVersion: String(versionNumber),
        });
        return Number(versionNumber);
    });
    const toAttributes = Effect.fn(function* (template, runtime = {}) {
        return {
            launchTemplateId: template.LaunchTemplateId,
            launchTemplateArn: yield* toArn(template.LaunchTemplateId),
            launchTemplateName: template.LaunchTemplateName,
            defaultVersionNumber: Number(template.DefaultVersionNumber ?? 1),
            latestVersionNumber: Number(template.LatestVersionNumber ?? template.DefaultVersionNumber ?? 1),
            tags: toTagRecord(template.Tags),
            roleArn: runtime.roleArn,
            roleName: runtime.roleName,
            policyName: runtime.policyName,
            managedIam: runtime.managedIam,
            runtimeUnitName: runtime.runtimeUnitName,
            assetPrefix: runtime.assetPrefix,
            code: runtime.code,
        };
    });
    return {
        stables: [
            "launchTemplateId",
            "launchTemplateArn",
            "launchTemplateName",
        ],
        diff: Effect.fn(function* ({ id, olds, news: _news, output }) {
            if (!isResolved(_news))
                return undefined;
            const news = _news;
            const oldName = yield* toName(id, olds ?? {});
            const newName = yield* toName(id, news ?? {});
            if (oldName !== newName) {
                return { action: "replace" };
            }
            if (!deepEqual(olds, news)) {
                return {
                    action: "update",
                    stables: [
                        "launchTemplateId",
                        "launchTemplateArn",
                        "launchTemplateName",
                    ],
                };
            }
            // The hosted bundle hash participates in planning: a change confined
            // to the runtime program (or its imports) leaves every prop equal,
            // so re-bundle and compare against the deployed hash. A mismatch
            // plans an in-place update, whose reconcile publishes a new template
            // version carrying the new bundle.
            if (news.main && output?.code?.hash) {
                const { hash } = yield* hosted.bundleProgram(id, news);
                if (hash !== output.code.hash) {
                    return {
                        action: "update",
                        stables: [
                            "launchTemplateId",
                            "launchTemplateArn",
                            "launchTemplateName",
                        ],
                    };
                }
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const template = (output?.launchTemplateId &&
                (yield* describeById(output.launchTemplateId))) ??
                (yield* describeByName(yield* toName(id, olds ?? {})));
            return template
                ? yield* toAttributes(template, {
                    roleArn: output?.roleArn,
                    roleName: output?.roleName,
                    policyName: output?.policyName,
                    managedIam: output?.managedIam,
                    runtimeUnitName: output?.runtimeUnitName,
                    assetPrefix: output?.assetPrefix,
                    code: output?.code,
                })
                : undefined;
        }),
        list: () => ec2.describeLaunchTemplates.pages({}).pipe(Stream.runCollect, Effect.flatMap((chunk) => Effect.forEach(Array.from(chunk).flatMap((page) => page.LaunchTemplates ?? []), (template) => toAttributes(template)))),
        reconcile: Effect.fn(function* ({ id, news, output, bindings, session, }) {
            const launchTemplateName = output?.launchTemplateName ?? (yield* toName(id, news));
            const desiredTags = {
                ...(yield* createInternalTags(id)),
                ...news.tags,
            };
            const runtime = yield* hosted.resolveHostedRuntime({
                id,
                news,
                bindings,
                output,
            });
            // Observe — fetch live cloud state. We try both lookup paths
            // (id from output, name from desired) so the reconciler
            // converges whether `output` is fresh, stale, or missing.
            let existing = (output?.launchTemplateId &&
                (yield* describeById(output.launchTemplateId))) ||
                (yield* describeByName(launchTemplateName));
            // Ensure — create the launch template if missing. We must
            // verify alchemy ownership via tags here (since this resource
            // does not implement `read` adoption gating).
            if (!existing) {
                const created = yield* ec2.createLaunchTemplate({
                    LaunchTemplateName: launchTemplateName,
                    VersionDescription: runtime.code?.hash ?? "alchemy-create",
                    TagSpecifications: [
                        {
                            ResourceType: "launch-template",
                            Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                                Key,
                                Value,
                            })),
                        },
                    ],
                    LaunchTemplateData: hosted.buildLaunchTemplateData({
                        imageId: news.imageId,
                        instanceType: news.instanceType,
                        keyName: news.keyName,
                        securityGroupIds: news.securityGroupIds,
                        associatePublicIpAddress: news.associatePublicIpAddress,
                        tags: desiredTags,
                    }, runtime),
                });
                const template = created.LaunchTemplate;
                if (!template?.LaunchTemplateId || !template.LaunchTemplateName) {
                    return yield* Effect.fail(new Error(`createLaunchTemplate returned no launch template for '${id}'`));
                }
                yield* session.note(template.LaunchTemplateId);
                return yield* toAttributes(template, runtime);
            }
            if (!hasTags(desiredTags, toTagRecord(existing.Tags))) {
                return yield* Effect.fail(new Error(`Launch template '${launchTemplateName}' already exists and is not managed by alchemy`));
            }
            // Sync version — each reconcile creates a new version pinned as
            // the default. ASGs that reference `$Default` automatically
            // pick up the new version.
            yield* createVersion({
                launchTemplateId: existing.LaunchTemplateId,
                news,
                runtime,
            });
            // Sync tags — diff observed cloud tags against desired.
            yield* syncTemplateTags({
                launchTemplateId: existing.LaunchTemplateId,
                oldTags: toTagRecord(existing.Tags),
                newTags: desiredTags,
            });
            const refreshed = yield* describeById(existing.LaunchTemplateId);
            if (!refreshed) {
                return yield* Effect.fail(new Error(`Launch template '${launchTemplateName}' was not readable after reconcile`));
            }
            yield* session.note(refreshed.LaunchTemplateId);
            return yield* toAttributes(refreshed, runtime);
        }),
        delete: Effect.fn(function* ({ output, session }) {
            yield* ec2
                .deleteLaunchTemplate({
                LaunchTemplateId: output.launchTemplateId,
            })
                .pipe(Effect.catch((error) => isLaunchTemplateNotFound(error)
                ? Effect.void
                : Effect.fail(error)));
            yield* hosted.cleanupHostedRuntime({ output, session });
        }),
    };
}));
const isLaunchTemplateNotFound = (error) => {
    const tag = error?._tag;
    return (tag === "InvalidLaunchTemplateNameNotFoundException" ||
        tag === "InvalidLaunchTemplateIdNotFoundException" ||
        tag === "InvalidLaunchTemplateId.Malformed" ||
        tag === "InvalidLaunchTemplateId.NotFound" ||
        // Live `describeLaunchTemplates` surfaces the dot-form codes, which the
        // ec2 SDK leaves untyped — a missing template on the read-before-create
        // probe otherwise fails the whole plan.
        tag === "InvalidLaunchTemplateName.NotFoundException" ||
        tag === "InvalidLaunchTemplateId.NotFoundException");
};
const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => Boolean(tag.Key && tag.Value !== undefined))
    .map((tag) => [tag.Key, tag.Value]));
//# sourceMappingURL=LaunchTemplate.js.map