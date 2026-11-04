import * as Lambda from "@distilled.cloud/aws/lambda";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { deepEqual, isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { Stack } from "../../Stack.js";
import { Stage } from "../../Stage.js";
import { sha256Object } from "../../Util/sha256.js";
/**
 * Resource references resolve to their Attributes before provider lifecycle
 * methods run. Provider's generic Props type intentionally preserves the
 * author-facing resource type, so expose that engine guarantee in one place.
 */
const resolvedProps = (props) => props;
const VersionResource = Resource("AWS.Lambda.Version", {
    defaultRemovalPolicy: "retain",
});
/**
 * An immutable numbered version of a managed Lambda function.
 *
 * The provider publishes only after the Function's code and configuration
 * have settled. Re-applying unchanged code and versioned configuration reuses
 * the existing version. Function-level operational changes, such as reserved
 * concurrency, do not publish a new version.
 *
 * Versions default to **retain** on removal. Moving or deleting an alias never
 * deletes an older version, so in-flight durable executions can continue
 * replaying against the code that started them. Use `destroy()` only when the
 * exact numbered version is safe to remove.
 *
 * ### Publishing a Version
 * **Example:** Publish a Managed Function
 * ```typescript
 * const fn = yield* AWS.Lambda.Function("Handler", {
 *   main: import.meta.resolve("./handler.ts"),
 * });
 * const version = yield* AWS.Lambda.Version("HandlerVersion", {
 *   function: fn,
 * });
 * ```
 *
 * ### Promoting with an Alias
 * **Example:** Stable Production Alias
 * ```typescript
 * const version = yield* AWS.Lambda.Version("CampaignRunVersion", {
 *   function: campaign.function,
 * });
 * const live = yield* AWS.Lambda.Alias("CampaignRunLive", {
 *   version,
 *   aliasName: "live",
 * });
 * ```
 *
 * ### Explicit Deletion
 * **Example:** Delete the Exact Version on Stack Destroy
 * ```typescript
 * import { destroy } from "alchemy/RemovalPolicy";
 *
 * const disposable = yield* AWS.Lambda.Version("PreviewVersion", {
 *   function: fn,
 * }).pipe(destroy());
 * ```
 *
 * @resource
 */
export const Version = Object.assign((id, props) => VersionResource(id, {
    function: props.function,
    deploymentHash: props.function.code.hash,
}), {
    Type: VersionResource.Type,
    Provider: VersionResource.Provider,
    Self: VersionResource.Self,
    Aliases: VersionResource.Aliases,
    ref: VersionResource.ref,
});
const MARKER_RE = /^\[alchemy:v=1;o=([a-f0-9]{64});i=([a-f0-9]{64});s=([a-f0-9]{64})\]$/;
const parseMarker = (description) => {
    const match = description?.match(MARKER_RE);
    return match
        ? {
            ownerHash: match[1],
            instanceHash: match[2],
            sourceHash: match[3],
        }
        : undefined;
};
const isNumberedVersion = (version) => version !== undefined && /^[1-9]\d*$/.test(version);
export const VersionProvider = () => Provider.effect(VersionResource, Effect.gen(function* () {
    const ownerIdentity = Effect.fn(function* (id, fqn, instanceId) {
        const stack = yield* Stack;
        const stage = yield* Stage;
        return {
            ownerHash: yield* sha256Object({
                stack: stack.name,
                stage,
                fqn,
                id,
            }),
            instanceHash: yield* sha256Object({ instanceId }),
        };
    });
    const sourceHashOf = (functionArn, codeSha256, configSha256) => sha256Object({
        functionArn,
        codeSha256,
        configSha256,
    });
    const markerFor = Effect.fn(function* (id, fqn, instanceId, sourceHash) {
        const identity = yield* ownerIdentity(id, fqn, instanceId);
        return {
            ...identity,
            sourceHash,
            description: `[alchemy:v=1;o=${identity.ownerHash};i=${identity.instanceHash};s=${sourceHash}]`,
        };
    });
    const publishableConfiguration = (configuration) => ({
        runtime: configuration.Runtime,
        role: configuration.Role,
        handler: configuration.Handler,
        timeout: configuration.Timeout,
        memorySize: configuration.MemorySize,
        vpc: configuration.VpcConfig
            ? {
                subnetIds: [...(configuration.VpcConfig.SubnetIds ?? [])].sort(),
                securityGroupIds: [
                    ...(configuration.VpcConfig.SecurityGroupIds ?? []),
                ].sort(),
                ipv6AllowedForDualStack: configuration.VpcConfig.Ipv6AllowedForDualStack,
            }
            : undefined,
        deadLetterConfig: configuration.DeadLetterConfig,
        environment: Object.fromEntries(Object.entries(configuration.Environment?.Variables ?? {}).map(([key, value]) => [
            key,
            Redacted.isRedacted(value) ? Redacted.value(value) : value,
        ])),
        kmsKeyArn: configuration.KMSKeyArn,
        tracingConfig: configuration.TracingConfig,
        layers: configuration.Layers?.map((layer) => layer.Arn),
        fileSystemConfigs: configuration.FileSystemConfigs,
        packageType: configuration.PackageType,
        imageConfig: configuration.ImageConfigResponse?.ImageConfig,
        architectures: configuration.Architectures,
        ephemeralStorage: configuration.EphemeralStorage,
        snapStart: configuration.SnapStart?.ApplyOn,
        loggingConfig: configuration.LoggingConfig,
        tenancyConfig: configuration.TenancyConfig,
        capacityProviderConfig: configuration.CapacityProviderConfig,
        durableConfig: configuration.DurableConfig,
    });
    const completeConfiguration = Effect.fn(function* (functionName, configuration) {
        if (!configuration.FunctionArn ||
            !configuration.FunctionName ||
            !configuration.CodeSha256) {
            throw new Error(`Lambda function ${functionName} did not return the hashes required to publish a version.`);
        }
        return {
            functionArn: configuration.FunctionArn.replace(/:(?:\$LATEST|[1-9]\d*)$/, ""),
            functionName: configuration.FunctionName,
            codeSha256: configuration.CodeSha256,
            configSha256: yield* sha256Object(publishableConfiguration(configuration)),
        };
    });
    const snapshot = Effect.fn(function* (configuration) {
        if (!isNumberedVersion(configuration.Version))
            return undefined;
        const complete = yield* completeConfiguration(configuration.FunctionName ?? "unknown", configuration);
        const sourceHash = yield* sourceHashOf(complete.functionArn, complete.codeSha256, complete.configSha256);
        return {
            ...complete,
            version: configuration.Version,
            versionArn: `${complete.functionArn}:${configuration.Version}`,
            sourceHash,
        };
    });
    const getVersion = (functionName, version) => Lambda.getFunctionConfiguration({
        FunctionName: functionName,
        Qualifier: version,
    }).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const listVersions = (functionName) => Lambda.listVersionsByFunction
        .items({ FunctionName: functionName })
        .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).filter((version) => isNumberedVersion(version.Version))), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed([])));
    const waitForLatest = Effect.fn(function* (functionName) {
        const configuration = yield* Lambda.getFunctionConfiguration({
            FunctionName: functionName,
            Qualifier: "$LATEST",
        }).pipe(Effect.repeat({
            schedule: Schedule.spaced("1 second"),
            until: (current) => current.State !== "Pending" &&
                current.State !== "Deactivating" &&
                current.LastUpdateStatus !== "InProgress",
            times: 45,
        }));
        if (configuration.State === "Failed" ||
            configuration.State === "Deactivated" ||
            configuration.State === "Deleting" ||
            configuration.LastUpdateStatus === "Failed") {
            return yield* Effect.die(new Error(`Lambda function ${functionName} did not settle successfully: ${configuration.LastUpdateStatusReason ??
                configuration.StateReason ??
                configuration.LastUpdateStatus ??
                configuration.State ??
                "unknown state"}`));
        }
        return configuration;
    });
    const findOwnedVersion = Effect.fn(function* (functionName, marker) {
        const versions = yield* listVersions(functionName);
        const matches = versions
            .flatMap((version) => {
            const parsed = parseMarker(version.Description);
            return parsed?.ownerHash === marker.ownerHash &&
                parsed.sourceHash === marker.sourceHash
                ? [version]
                : [];
        })
            .sort((a, b) => Number.parseInt(b.Version, 10) - Number.parseInt(a.Version, 10));
        return (matches.find((version) => parseMarker(version.Description)?.instanceHash ===
            marker.instanceHash) ?? matches[0]);
    });
    return {
        nuke: { skip: true },
        stables: ["functionName", "functionArn"],
        diff: Effect.fn(function* ({ olds, news, output }) {
            const pendingFunctionName = news.function?.functionName;
            if (output &&
                pendingFunctionName !== undefined &&
                isResolved(pendingFunctionName) &&
                resolvedProps(olds).function.functionName !== pendingFunctionName) {
                return { action: "replace" };
            }
            if (!isResolved(news)) {
                return output ? { action: "update" } : undefined;
            }
            const resolvedOlds = resolvedProps(olds);
            const resolvedNews = resolvedProps(news);
            if (!output)
                return undefined;
            if (!Object.prototype.hasOwnProperty.call(resolvedNews.function, "code") ||
                !deepEqual(resolvedOlds.function, resolvedNews.function)) {
                return { action: "update" };
            }
            return { action: "noop" };
        }),
        read: Effect.fn(function* ({ id, fqn, instanceId, olds, output }) {
            if (output) {
                const observed = yield* getVersion(output.functionName, output.version);
                if (!observed)
                    return undefined;
                const attrs = yield* snapshot(observed);
                if (!attrs)
                    return undefined;
                const marker = parseMarker(observed.Description);
                const identity = yield* ownerIdentity(id, fqn, instanceId);
                return marker?.ownerHash === identity.ownerHash &&
                    marker.sourceHash === attrs.sourceHash
                    ? attrs
                    : Unowned(attrs);
            }
            const functionName = olds
                ? resolvedProps(olds).function.functionName
                : undefined;
            if (!functionName)
                return undefined;
            const latest = yield* waitForLatest(functionName);
            const complete = yield* completeConfiguration(functionName, latest);
            const sourceHash = yield* sourceHashOf(complete.functionArn, complete.codeSha256, complete.configSha256);
            const desired = yield* markerFor(id, fqn, instanceId, sourceHash);
            const recovered = yield* findOwnedVersion(functionName, desired);
            return recovered ? yield* snapshot(recovered) : undefined;
        }),
        list: () => Effect.gen(function* () {
            const functionNames = yield* Lambda.listFunctions.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
                .map((fn) => fn.FunctionName)
                .filter((name) => name !== undefined)));
            const versions = yield* Effect.forEach(functionNames, (functionName) => listVersions(functionName).pipe(Effect.flatMap((items) => Effect.forEach(items, snapshot, { concurrency: 10 })), Effect.map((items) => items.filter((item) => item !== undefined))), { concurrency: 10 });
            return versions.flat();
        }),
        reconcile: Effect.fn(function* ({ id, fqn, instanceId, news, session, }) {
            const resolvedNews = resolvedProps(news);
            const ensure = Effect.gen(function* () {
                const latest = yield* waitForLatest(resolvedNews.function.functionName);
                const complete = yield* completeConfiguration(resolvedNews.function.functionName, latest);
                const sourceHash = yield* sourceHashOf(complete.functionArn, complete.codeSha256, complete.configSha256);
                const marker = yield* markerFor(id, fqn, instanceId, sourceHash);
                const existing = yield* findOwnedVersion(complete.functionName, marker);
                if (existing) {
                    const attrs = yield* snapshot(existing);
                    if (attrs)
                        return attrs;
                }
                const published = yield* Lambda.publishVersion({
                    FunctionName: complete.functionName,
                    CodeSha256: complete.codeSha256,
                    RevisionId: latest.RevisionId,
                    Description: marker.description,
                });
                const attrs = yield* snapshot(published);
                if (!attrs ||
                    attrs.sourceHash !== sourceHash ||
                    published.Description !== marker.description) {
                    return yield* Effect.die(new Error(`Lambda function ${complete.functionName} did not return the expected published version.`));
                }
                return attrs;
            }).pipe(Effect.retry({
                while: (error) => error._tag === "PreconditionFailedException" ||
                    error._tag === "ResourceConflictException",
                schedule: Schedule.max([
                    Schedule.exponential("250 millis"),
                    Schedule.recurs(8),
                ]),
            }));
            const attrs = yield* ensure;
            yield* session.note(`Version ${attrs.functionName}:${attrs.version}`);
            return attrs;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* Lambda.deleteFunction({
                FunctionName: output.functionName,
                Qualifier: output.version,
            }).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Version.js.map