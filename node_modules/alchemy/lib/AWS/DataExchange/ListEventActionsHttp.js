import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeDataExchangeAccountHttpBinding } from "./BindingHttp.js";
import { ListEventActions } from "./ListEventActions.js";
export const ListEventActionsHttp = Layer.effect(ListEventActions, makeDataExchangeAccountHttpBinding({
    tag: "AWS.DataExchange.ListEventActions",
    operation: dataexchange.listEventActions,
    actions: ["dataexchange:ListEventActions"],
}));
//# sourceMappingURL=ListEventActionsHttp.js.map