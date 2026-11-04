import * as emr from "@distilled.cloud/aws/emr-serverless";
import * as Layer from "effect/Layer";
import { makeEmrServerlessHttpBinding } from "./BindingHttp.js";
import { GetSessionEndpoint } from "./GetSessionEndpoint.js";
export const GetSessionEndpointHttp = Layer.effect(GetSessionEndpoint, makeEmrServerlessHttpBinding({
    tag: "AWS.EMRServerless.GetSessionEndpoint",
    operation: emr.getSessionEndpoint,
    actions: ["emr-serverless:GetSessionEndpoint"],
    subresources: ["/sessions/*"],
}));
//# sourceMappingURL=GetSessionEndpointHttp.js.map