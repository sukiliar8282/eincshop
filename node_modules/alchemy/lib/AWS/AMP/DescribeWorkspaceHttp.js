import * as amp from "@distilled.cloud/aws/amp";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { isBindingHost } from "../Lambda/Function.js";
import { DescribeWorkspace } from "./DescribeWorkspace.js";
export const DescribeWorkspaceHttp = Layer.effect(DescribeWorkspace, Effect.gen(function* () {
    const describeWorkspace = yield* amp.describeWorkspace;
    return Effect.fn(function* (workspace) {
        const WorkspaceId = yield* workspace.workspaceId;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.AMP.DescribeWorkspace(${workspace}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["aps:DescribeWorkspace"],
                            Resource: [workspace.workspaceArn],
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.AMP.DescribeWorkspace(${workspace.LogicalId})`)(function* () {
            return yield* describeWorkspace({
                workspaceId: yield* WorkspaceId,
            });
        });
    });
}));
//# sourceMappingURL=DescribeWorkspaceHttp.js.map