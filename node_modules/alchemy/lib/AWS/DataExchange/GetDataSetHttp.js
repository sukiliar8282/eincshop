import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeDataSetHttpBinding } from "./BindingHttp.js";
import { GetDataSet } from "./GetDataSet.js";
export const GetDataSetHttp = Layer.effect(GetDataSet, makeDataSetHttpBinding({
    tag: "AWS.DataExchange.GetDataSet",
    operation: dataexchange.getDataSet,
    actions: ["dataexchange:GetDataSet"],
}));
//# sourceMappingURL=GetDataSetHttp.js.map