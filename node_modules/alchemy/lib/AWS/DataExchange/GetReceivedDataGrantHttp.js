import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeDataExchangeAccountHttpBinding } from "./BindingHttp.js";
import { GetReceivedDataGrant } from "./GetReceivedDataGrant.js";
export const GetReceivedDataGrantHttp = Layer.effect(GetReceivedDataGrant, makeDataExchangeAccountHttpBinding({
    tag: "AWS.DataExchange.GetReceivedDataGrant",
    operation: dataexchange.getReceivedDataGrant,
    actions: ["dataexchange:GetReceivedDataGrant"],
}));
//# sourceMappingURL=GetReceivedDataGrantHttp.js.map