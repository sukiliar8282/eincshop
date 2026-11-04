import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { ListBootstrapActions } from "./ListBootstrapActions.js";
export const ListBootstrapActionsHttp = Layer.effect(ListBootstrapActions, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.ListBootstrapActions",
    operation: emr.listBootstrapActions,
    actions: ["elasticmapreduce:ListBootstrapActions"],
}));
//# sourceMappingURL=ListBootstrapActionsHttp.js.map