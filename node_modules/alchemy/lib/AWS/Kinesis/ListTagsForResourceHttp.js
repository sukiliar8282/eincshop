import * as Kinesis from "@distilled.cloud/aws/kinesis";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.js";
import * as Layer from "effect/Layer";
import { isBindingHost } from "../Lambda/Function.js";
import { ListTagsForResource, } from "./ListTagsForResource.js";
export const ListTagsForResourceHttp = Layer.effect(ListTagsForResource, Effect.gen(function* () {
    const listTagsForResource = yield* Kinesis.listTagsForResource;
    return Effect.fn(function* (resource) {
        const ResourceARN = yield* getResourceArn(resource);
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.Kinesis.ListTagsForResource(${resource}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["kinesis:ListTagsForResource"],
                            Resource: [getResourceArn(resource)],
                        },
                    ],
                });
            }
        }
        return Effect.fn(`AWS.Kinesis.ListTagsForResource(${resource.LogicalId})`)(function* (request) {
            return yield* listTagsForResource({
                ...request,
                ResourceARN: yield* ResourceARN,
            });
        });
    });
}));
const getResourceArn = (resource) => "consumerArn" in resource ? resource.consumerArn : resource.streamArn;
//# sourceMappingURL=ListTagsForResourceHttp.js.map