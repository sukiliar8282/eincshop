import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeDataExchangeAccountHttpBinding } from "./BindingHttp.js";
import { ListDataGrants } from "./ListDataGrants.js";
export const ListDataGrantsHttp = Layer.effect(ListDataGrants, makeDataExchangeAccountHttpBinding({
    tag: "AWS.DataExchange.ListDataGrants",
    operation: dataexchange.listDataGrants,
    actions: ["dataexchange:ListDataGrants"],
}));
//# sourceMappingURL=ListDataGrantsHttp.js.map