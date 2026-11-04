import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsEndpointHttpBinding } from "./BindingHttp.js";
import { PublishToEndpoint } from "./PublishToEndpoint.js";
export const PublishToEndpointHttp = Layer.effect(PublishToEndpoint, makeSnsEndpointHttpBinding({
    tag: "AWS.SNS.PublishToEndpoint",
    operation: sns.publish,
    actions: ["sns:Publish"],
}));
//# sourceMappingURL=PublishToEndpointHttp.js.map