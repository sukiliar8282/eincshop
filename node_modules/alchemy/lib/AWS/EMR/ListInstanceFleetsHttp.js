import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { ListInstanceFleets } from "./ListInstanceFleets.js";
export const ListInstanceFleetsHttp = Layer.effect(ListInstanceFleets, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.ListInstanceFleets",
    operation: emr.listInstanceFleets,
    actions: ["elasticmapreduce:ListInstanceFleets"],
}));
//# sourceMappingURL=ListInstanceFleetsHttp.js.map