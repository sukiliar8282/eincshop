import * as rolesanywhere from "@distilled.cloud/aws/rolesanywhere";
import * as Layer from "effect/Layer";
import { makeRolesAnywhereHttpBinding } from "./BindingHttp.js";
import { GetSubject } from "./GetSubject.js";
export const GetSubjectHttp = Layer.effect(GetSubject, makeRolesAnywhereHttpBinding({
    capability: "GetSubject",
    iamActions: ["rolesanywhere:GetSubject"],
    operation: rolesanywhere.getSubject,
}));
//# sourceMappingURL=GetSubjectHttp.js.map