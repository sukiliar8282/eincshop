import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsAccountHttpBinding } from "./BindingHttp.js";
import { GetRun } from "./GetRun.js";
export const GetRunHttp = Layer.effect(GetRun, makeOmicsAccountHttpBinding({
    tag: "AWS.Omics.GetRun",
    operation: omics.getRun,
    actions: ["omics:GetRun"],
}));
//# sourceMappingURL=GetRunHttp.js.map