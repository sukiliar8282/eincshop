import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { ModifyInstanceFleet } from "./ModifyInstanceFleet.js";
export const ModifyInstanceFleetHttp = Layer.effect(ModifyInstanceFleet, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.ModifyInstanceFleet",
    operation: emr.modifyInstanceFleet,
    actions: ["elasticmapreduce:ModifyInstanceFleet"],
}));
//# sourceMappingURL=ModifyInstanceFleetHttp.js.map