import * as iam from "@distilled.cloud/aws/iam";
import * as Layer from "effect/Layer";
import { makeIamHttpBinding } from "./BindingHttp.js";
import { GetServiceLastAccessedDetailsWithEntities } from "./GetServiceLastAccessedDetailsWithEntities.js";
export const GetServiceLastAccessedDetailsWithEntitiesHttp = Layer.effect(GetServiceLastAccessedDetailsWithEntities, makeIamHttpBinding({
    capability: "GetServiceLastAccessedDetailsWithEntities",
    iamActions: ["iam:GetServiceLastAccessedDetailsWithEntities"],
    operation: iam.getServiceLastAccessedDetailsWithEntities,
}));
//# sourceMappingURL=GetServiceLastAccessedDetailsWithEntitiesHttp.js.map