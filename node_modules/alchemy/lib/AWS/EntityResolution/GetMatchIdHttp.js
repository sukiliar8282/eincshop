import * as entityresolution from "@distilled.cloud/aws/entityresolution";
import * as Layer from "effect/Layer";
import { makeWorkflowHttpBinding } from "./BindingHttp.js";
import { GetMatchId } from "./GetMatchId.js";
export const GetMatchIdHttp = Layer.effect(GetMatchId, makeWorkflowHttpBinding({
    tag: "AWS.EntityResolution.GetMatchId",
    operation: entityresolution.getMatchId,
    actions: ["entityresolution:GetMatchId"],
}));
//# sourceMappingURL=GetMatchIdHttp.js.map