import * as backup from "@distilled.cloud/aws/backup";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import * as Output from "../../Output.js";
import { isBindingHost } from "../Lambda/Function.js";
import { StartCopyJob } from "./StartCopyJob.js";
export const StartCopyJobHttp = Layer.effect(StartCopyJob, Effect.gen(function* () {
    const startCopyJob = yield* backup.startCopyJob;
    return Effect.fn(function* (sourceVault, copyRole) {
        const SourceBackupVaultName = yield* sourceVault.backupVaultName;
        const RoleArn = yield* copyRole.roleArn;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.Backup.StartCopyJob(${sourceVault}, ${copyRole}))`({
                    policyStatements: [
                        // StartCopyJob authorizes on the recovery point's underlying
                        // resource ARN and CopyIntoBackupVault on the destination
                        // vault — both runtime request fields, so the grant is `*`.
                        {
                            Effect: "Allow",
                            Action: ["backup:StartCopyJob", "backup:CopyIntoBackupVault"],
                            Resource: ["*"],
                        },
                        // CRITICAL: without iam:PassRole on the copy role,
                        // StartCopyJob fails only at runtime with an AccessDenied.
                        {
                            Effect: "Allow",
                            Action: ["iam:PassRole"],
                            Resource: [Output.interpolate `${copyRole.roleArn}`],
                            Condition: {
                                StringEquals: {
                                    "iam:PassedToService": "backup.amazonaws.com",
                                },
                            },
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.Backup.StartCopyJob(${sourceVault.LogicalId})`)(function* (request) {
            return yield* startCopyJob({
                ...request,
                SourceBackupVaultName: yield* SourceBackupVaultName,
                IamRoleArn: request.IamRoleArn ?? (yield* RoleArn),
            });
        });
    });
}));
//# sourceMappingURL=StartCopyJobHttp.js.map