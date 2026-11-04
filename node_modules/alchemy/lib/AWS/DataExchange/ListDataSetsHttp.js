import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeDataExchangeAccountHttpBinding } from "./BindingHttp.js";
import { ListDataSets } from "./ListDataSets.js";
export const ListDataSetsHttp = Layer.effect(ListDataSets, makeDataExchangeAccountHttpBinding({
    tag: "AWS.DataExchange.ListDataSets",
    operation: dataexchange.listDataSets,
    actions: ["dataexchange:ListDataSets"],
}));
//# sourceMappingURL=ListDataSetsHttp.js.map