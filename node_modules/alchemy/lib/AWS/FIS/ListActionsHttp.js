import * as fis from "@distilled.cloud/aws/fis";
import * as Layer from "effect/Layer";
import { makeFisAccountHttpBinding } from "./BindingHttp.js";
import { ListActions } from "./ListActions.js";
export const ListActionsHttp = Layer.effect(ListActions, makeFisAccountHttpBinding({
    tag: "AWS.FIS.ListActions",
    operation: fis.listActions,
    actions: ["fis:ListActions"],
}));
//# sourceMappingURL=ListActionsHttp.js.map