import * as wafv2 from "@distilled.cloud/aws/wafv2";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { isBindingHost } from "../Lambda/Function.js";
import { retryOptimisticLock, withWafScope } from "./internal.js";
import { UpdateIPSet } from "./UpdateIPSet.js";
/**
 * Bespoke (multi-op) binding: reads the IP set for a fresh `LockToken`,
 * applies the full-replacement update, and retries optimistic-lock
 * conflicts by re-reading.
 */
export const UpdateIPSetHttp = Layer.effect(UpdateIPSet, Effect.gen(function* () {
    const get = yield* wafv2.getIPSet;
    const update = yield* wafv2.updateIPSet;
    return Effect.fn(function* (ipSet) {
        const Name = yield* ipSet.ipSetName;
        const Id = yield* ipSet.ipSetId;
        const Scope = yield* ipSet.scope;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.WAFv2.UpdateIPSet(${ipSet}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["wafv2:GetIPSet", "wafv2:UpdateIPSet"],
                            Resource: [ipSet.ipSetArn],
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.WAFv2.UpdateIPSet(${ipSet.LogicalId})`)(function* (request) {
            const scope = yield* Scope;
            const key = { Name: yield* Name, Scope: scope, Id: yield* Id };
            return yield* retryOptimisticLock(withWafScope(scope, Effect.gen(function* () {
                const fresh = yield* get(key);
                return yield* update({
                    ...key,
                    Addresses: request.addresses,
                    Description: request.description ?? fresh.IPSet?.Description,
                    LockToken: fresh.LockToken ?? "",
                });
            })));
        });
    });
}));
//# sourceMappingURL=UpdateIPSetHttp.js.map