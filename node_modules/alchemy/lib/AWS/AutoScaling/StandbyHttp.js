import * as autoscaling from "@distilled.cloud/aws/auto-scaling";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { isInstance } from "../EC2/Instance.js";
import { isBindingHost } from "../Lambda/Function.js";
import { Standby, } from "./Standby.js";
// Bespoke (not the shared scaffold): a multi-operation client over
// `enterStandby` + `exitStandby` behind one IAM grant.
export const StandbyHttp = Layer.effect(Standby, Effect.gen(function* () {
    const enter = yield* autoscaling.enterStandby;
    const exit = yield* autoscaling.exitStandby;
    return Effect.fn(function* (group) {
        const AutoScalingGroupName = yield* group.autoScalingGroupName;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host) || isInstance(host)) {
                yield* host.bind `Allow(${host}, AWS.AutoScaling.Standby(${group}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["autoscaling:EnterStandby", "autoscaling:ExitStandby"],
                            Resource: [group.autoScalingGroupArn],
                        },
                    ],
                });
            }
        }
        return {
            enter: Effect.fn(`AWS.AutoScaling.EnterStandby(${group.LogicalId})`)(function* (request) {
                return yield* enter({
                    ...request,
                    AutoScalingGroupName: yield* AutoScalingGroupName,
                });
            }),
            exit: Effect.fn(`AWS.AutoScaling.ExitStandby(${group.LogicalId})`)(function* (request) {
                return yield* exit({
                    ...request,
                    AutoScalingGroupName: yield* AutoScalingGroupName,
                });
            }),
        };
    });
}));
//# sourceMappingURL=StandbyHttp.js.map