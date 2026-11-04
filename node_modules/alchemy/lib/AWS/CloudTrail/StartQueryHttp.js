import * as cloudtrail from "@distilled.cloud/aws/cloudtrail";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { isBindingHost } from "../Lambda/Function.js";
import { StartQuery } from "./StartQuery.js";
/**
 * Bespoke (not scaffolded): the runtime callable resolves the bound store's
 * ID out of its ARN and threads it through a `QueryStatement` callback —
 * CloudTrail Lake SQL references the store by ID in the `FROM` clause rather
 * than as a request field.
 */
export const StartQueryHttp = Layer.effect(StartQuery, Effect.gen(function* () {
    const startQuery = yield* cloudtrail.startQuery;
    return Effect.fn(function* (store) {
        const Arn = yield* store.eventDataStoreArn;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.CloudTrail.StartQuery(${store}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["cloudtrail:StartQuery"],
                            Resource: [store.eventDataStoreArn],
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.CloudTrail.StartQuery(${store.LogicalId})`)(function* (request) {
            const arn = yield* Arn;
            const eventDataStoreId = arn.split("/").pop();
            const { QueryStatement, ...rest } = request;
            return yield* startQuery({
                ...rest,
                QueryStatement: typeof QueryStatement === "function"
                    ? QueryStatement(eventDataStoreId)
                    : QueryStatement,
            });
        });
    });
}));
//# sourceMappingURL=StartQueryHttp.js.map