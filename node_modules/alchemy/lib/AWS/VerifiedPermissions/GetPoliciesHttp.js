import * as AVP from "@distilled.cloud/aws/verifiedpermissions";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { isBindingHost } from "../Lambda/Function.js";
import { GetPolicies } from "./GetPolicies.js";
export const GetPoliciesHttp = Layer.effect(GetPolicies, Effect.gen(function* () {
    const batchGetPolicy = yield* AVP.batchGetPolicy;
    return Effect.fn(function* (store) {
        const PolicyStoreId = yield* store.policyStoreId;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.VerifiedPermissions.GetPolicies(${store}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            // BatchGetPolicy authorizes under verifiedpermissions:GetPolicy
                            Action: [
                                "verifiedpermissions:GetPolicy",
                                "verifiedpermissions:BatchGetPolicy",
                            ],
                            Resource: [store.policyStoreArn],
                        },
                    ],
                });
            }
        }
        const label = store.LogicalId;
        return {
            batchGetPolicy: Effect.fn(`AWS.VerifiedPermissions.BatchGetPolicy(${label})`)(function* (request) {
                const policyStoreId = yield* PolicyStoreId;
                return yield* batchGetPolicy({
                    requests: request.policyIds.map((policyId) => ({
                        policyStoreId,
                        policyId,
                    })),
                });
            }),
        };
    });
}));
//# sourceMappingURL=GetPoliciesHttp.js.map