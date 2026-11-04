import * as sdb from "@distilled.cloud/aws/simpledb";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { isBindingHost } from "../Lambda/Function.js";
import { ListDomains } from "./ListDomains.js";
/**
 * Account-level binding — bespoke rather than `makeSimpleDbBinding` because
 * `ListDomains` targets no single domain: SimpleDB IAM cannot scope it
 * narrower than every domain in the account, so the grant is
 * `sdb:ListDomains` on `domain/*` (expressed as `*`).
 */
export const ListDomainsHttp = Layer.effect(ListDomains, Effect.gen(function* () {
    const listDomains = yield* sdb.listDomains;
    return Effect.fn(function* () {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.SimpleDB.ListDomains())`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["sdb:ListDomains"],
                            Resource: ["*"],
                        },
                    ],
                });
            }
        }
        return Effect.fn("AWS.SimpleDB.ListDomains")(function* (request) {
            return yield* listDomains({ ...request });
        });
    });
}));
//# sourceMappingURL=ListDomainsHttp.js.map