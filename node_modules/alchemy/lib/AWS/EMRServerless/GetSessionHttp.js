import * as emr from "@distilled.cloud/aws/emr-serverless";
import * as Layer from "effect/Layer";
import { makeEmrServerlessHttpBinding } from "./BindingHttp.js";
import { GetSession } from "./GetSession.js";
export const GetSessionHttp = Layer.effect(GetSession, makeEmrServerlessHttpBinding({
    tag: "AWS.EMRServerless.GetSession",
    operation: emr.getSession,
    actions: ["emr-serverless:GetSession"],
    subresources: ["/sessions/*"],
}));
//# sourceMappingURL=GetSessionHttp.js.map