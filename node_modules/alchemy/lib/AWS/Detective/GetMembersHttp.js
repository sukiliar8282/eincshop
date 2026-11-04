import * as detective from "@distilled.cloud/aws/detective";
import * as Layer from "effect/Layer";
import { makeDetectiveGraphHttpBinding } from "./BindingHttp.js";
import { GetMembers } from "./GetMembers.js";
export const GetMembersHttp = Layer.effect(GetMembers, makeDetectiveGraphHttpBinding({
    tag: "AWS.Detective.GetMembers",
    operation: detective.getMembers,
    actions: ["detective:GetMembers"],
}));
//# sourceMappingURL=GetMembersHttp.js.map