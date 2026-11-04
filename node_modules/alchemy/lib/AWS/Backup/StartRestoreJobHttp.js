import * as backup from "@distilled.cloud/aws/backup";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import * as Output from "../../Output.js";
import { isBindingHost } from "../Lambda/Function.js";
import { StartRestoreJob, } from "./StartRestoreJob.js";
export const StartRestoreJobHttp = Layer.effect(StartRestoreJob, Effect.gen(function* () {
    const startRestoreJob = yield* backup.startRestoreJob;
    return Effect.fn(function* (restoreRole) {
        const RoleArn = yield* restoreRole.roleArn;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.Backup.StartRestoreJob(${restoreRole}))`({
                    policyStatements: [
                        // StartRestoreJob authorizes on the recovery point's
                        // underlying resource ARN (a snapshot ARN unknowable at
                        // deploy time), so the grant is on `*`.
                        {
                            Effect: "Allow",
                            Action: ["backup:StartRestoreJob"],
                            Resource: ["*"],
                        },
                        // CRITICAL: without iam:PassRole on the restore role,
                        // StartRestoreJob fails only at runtime with an AccessDenied.
                        {
                            Effect: "Allow",
                            Action: ["iam:PassRole"],
                            Resource: [Output.interpolate `${restoreRole.roleArn}`],
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
        return Effect.fn(`AWS.Backup.StartRestoreJob(${restoreRole.LogicalId})`)(function* (request) {
            return yield* startRestoreJob({
                ...request,
                IamRoleArn: request.IamRoleArn ?? (yield* RoleArn),
            });
        });
    });
}));
//# sourceMappingURL=StartRestoreJobHttp.js.map