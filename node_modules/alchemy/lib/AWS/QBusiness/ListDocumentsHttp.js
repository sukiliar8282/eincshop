import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessIndexHttpBinding } from "./BindingHttp.js";
import { ListDocuments } from "./ListDocuments.js";
export const ListDocumentsHttp = Layer.effect(ListDocuments, makeQBusinessIndexHttpBinding({
    tag: "AWS.QBusiness.ListDocuments",
    operation: qbusiness.listDocuments,
    actions: ["qbusiness:ListDocuments"],
}));
//# sourceMappingURL=ListDocumentsHttp.js.map