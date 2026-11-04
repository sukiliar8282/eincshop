import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeDataExchangeAccountHttpBinding } from "./BindingHttp.js";
import { GetDataGrant } from "./GetDataGrant.js";
export const GetDataGrantHttp = Layer.effect(GetDataGrant, makeDataExchangeAccountHttpBinding({
    tag: "AWS.DataExchange.GetDataGrant",
    operation: dataexchange.getDataGrant,
    actions: ["dataexchange:GetDataGrant"],
}));
//# sourceMappingURL=GetDataGrantHttp.js.map