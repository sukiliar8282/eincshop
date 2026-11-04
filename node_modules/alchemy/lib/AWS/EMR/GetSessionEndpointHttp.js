import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { GetSessionEndpoint } from "./GetSessionEndpoint.js";
export const GetSessionEndpointHttp = Layer.effect(GetSessionEndpoint, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.GetSessionEndpoint",
    operation: emr.getSessionEndpoint,
    actions: ["elasticmapreduce:GetSessionEndpoint"],
}));
//# sourceMappingURL=GetSessionEndpointHttp.js.map