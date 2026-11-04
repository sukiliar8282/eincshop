import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessIndexHttpBinding } from "./BindingHttp.js";
import { GetDocumentContent } from "./GetDocumentContent.js";
export const GetDocumentContentHttp = Layer.effect(GetDocumentContent, makeQBusinessIndexHttpBinding({
    tag: "AWS.QBusiness.GetDocumentContent",
    operation: qbusiness.getDocumentContent,
    actions: ["qbusiness:GetDocumentContent"],
}));
//# sourceMappingURL=GetDocumentContentHttp.js.map