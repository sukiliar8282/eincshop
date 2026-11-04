import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { isTask } from "../ECS/Task.js";
export const Mount = Binding.Service("AWS.EFS.Mount");
/**
 * Ergonomic alias of {@link Mount} — `yield* EFS.mount(accessPoint, { path })`.
 */
export const mount = Mount;
const isAccessPoint = (target) => target.Type === "AWS.EFS.AccessPoint";
const isLambdaFunction = (value) => typeof value === "object" &&
    value !== null &&
    value.Type === "AWS.Lambda.Function";
/**
 * Host-agnostic implementation of the {@link Mount} binding. Detects the
 * host (Lambda Function vs ECS Task) at deploy time and registers the
 * host-appropriate mount config + IAM through the binding channel; at
 * runtime it is a no-op that returns the mount path.
 */
export const MountLive = Layer.effect(Mount, Effect.gen(function* () {
    return Effect.fn(function* (target, options) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            const actions = options.readOnly
                ? ["elasticfilesystem:ClientMount"]
                : ["elasticfilesystem:ClientMount", "elasticfilesystem:ClientWrite"];
            if (isTask(host)) {
                // ECS: task-level EFS volume + container mount point. IAM auth +
                // transit encryption are always on so the task-role grant below is
                // what authorizes the mount.
                const volumeName = `efs-${target.LogicalId.replace(/[^A-Za-z0-9_-]+/g, "-")}`;
                yield* host.bind `Allow(${host}, AWS.EFS.Mount(${target}))`({
                    policyStatements: [
                        isAccessPoint(target)
                            ? {
                                Effect: "Allow",
                                Action: actions,
                                Resource: ["*"],
                                Condition: {
                                    StringEquals: {
                                        "elasticfilesystem:AccessPointArn": target.accessPointArn,
                                    },
                                },
                            }
                            : {
                                Effect: "Allow",
                                Action: actions,
                                Resource: [target.fileSystemArn],
                            },
                    ],
                    volumes: [
                        {
                            name: volumeName,
                            efsVolumeConfiguration: {
                                fileSystemId: target.fileSystemId,
                                transitEncryption: "ENABLED",
                                authorizationConfig: isAccessPoint(target)
                                    ? { accessPointId: target.accessPointId, iam: "ENABLED" }
                                    : { iam: "ENABLED" },
                            },
                        },
                    ],
                    mountPoints: [
                        {
                            sourceVolume: volumeName,
                            containerPath: options.path,
                            readOnly: options.readOnly,
                        },
                    ],
                });
            }
            else if (isLambdaFunction(host)) {
                // Lambda: FileSystemConfigs entry + access-point-scoped client
                // access on the execution role. Lambda only mounts access points.
                if (!isAccessPoint(target)) {
                    return yield* Effect.die(new Error(`AWS.EFS.Mount(${target.LogicalId}): Lambda can only mount an EFS access point — create an AWS.EFS.AccessPoint for the file system and mount that instead`));
                }
                if (!options.path.startsWith("/mnt/")) {
                    return yield* Effect.die(new Error(`AWS.EFS.Mount(${target.LogicalId}): Lambda mount paths must begin with /mnt/ (got ${options.path})`));
                }
                yield* host.bind `Allow(${host}, AWS.EFS.Mount(${target}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: actions,
                            Resource: ["*"],
                            Condition: {
                                StringEquals: {
                                    "elasticfilesystem:AccessPointArn": target.accessPointArn,
                                },
                            },
                        },
                    ],
                    fileSystemConfigs: [
                        {
                            arn: target.accessPointArn,
                            localMountPath: options.path,
                        },
                    ],
                });
            }
            else {
                return yield* Effect.die(new Error(`AWS.EFS.Mount(${target.LogicalId}): unsupported host ${host.Type} — EFS mounts are supported on AWS.Lambda.Function and AWS.ECS.Task`));
            }
        }
        return { path: options.path };
    });
}));
//# sourceMappingURL=Mount.js.map