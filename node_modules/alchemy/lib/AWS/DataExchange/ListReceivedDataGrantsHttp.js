import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeDataExchangeAccountHttpBinding } from "./BindingHttp.js";
import { ListReceivedDataGrants } from "./ListReceivedDataGrants.js";
export const ListReceivedDataGrantsHttp = Layer.effect(ListReceivedDataGrants, makeDataExchangeAccountHttpBinding({
    tag: "AWS.DataExchange.ListReceivedDataGrants",
    operation: dataexchange.listReceivedDataGrants,
    actions: ["dataexchange:ListReceivedDataGrants"],
}));
//# sourceMappingURL=ListReceivedDataGrantsHttp.js.map