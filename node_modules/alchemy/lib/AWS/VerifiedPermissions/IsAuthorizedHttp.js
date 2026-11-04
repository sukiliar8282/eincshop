import * as AVP from "@distilled.cloud/aws/verifiedpermissions";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { isBindingHost } from "../Lambda/Function.js";
import { IsAuthorized, } from "./IsAuthorized.js";
export const IsAuthorizedHttp = Layer.effect(IsAuthorized, Effect.gen(function* () {
    const isAuthorized = yield* AVP.isAuthorized;
    const isAuthorizedWithToken = yield* AVP.isAuthorizedWithToken;
    const batchIsAuthorized = yield* AVP.batchIsAuthorized;
    const batchIsAuthorizedWithToken = yield* AVP.batchIsAuthorizedWithToken;
    return Effect.fn(function* (store) {
        const PolicyStoreId = yield* store.policyStoreId;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.VerifiedPermissions.IsAuthorized(${store}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            // the batch operations authorize under the non-batch
                            // verifiedpermissions:IsAuthorized[WithToken] actions
                            Action: [
                                "verifiedpermissions:IsAuthorized",
                                "verifiedpermissions:IsAuthorizedWithToken",
                                "verifiedpermissions:BatchIsAuthorized",
                                "verifiedpermissions:BatchIsAuthorizedWithToken",
                            ],
                            Resource: [store.policyStoreArn],
                        },
                    ],
                });
            }
        }
        const label = store.LogicalId;
        return {
            isAuthorized: Effect.fn(`AWS.VerifiedPermissions.IsAuthorized(${label})`)(function* (request) {
                const policyStoreId = yield* PolicyStoreId;
                return yield* isAuthorized({ ...request, policyStoreId });
            }),
            isAuthorizedWithToken: Effect.fn(`AWS.VerifiedPermissions.IsAuthorizedWithToken(${label})`)(function* (request) {
                const policyStoreId = yield* PolicyStoreId;
                return yield* isAuthorizedWithToken({ ...request, policyStoreId });
            }),
            batchIsAuthorized: Effect.fn(`AWS.VerifiedPermissions.BatchIsAuthorized(${label})`)(function* (request) {
                const policyStoreId = yield* PolicyStoreId;
                return yield* batchIsAuthorized({ ...request, policyStoreId });
            }),
            batchIsAuthorizedWithToken: Effect.fn(`AWS.VerifiedPermissions.BatchIsAuthorizedWithToken(${label})`)(function* (request) {
                const policyStoreId = yield* PolicyStoreId;
                return yield* batchIsAuthorizedWithToken({
                    ...request,
                    policyStoreId,
                });
            }),
        };
    });
}));
//# sourceMappingURL=IsAuthorizedHttp.js.map