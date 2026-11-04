import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { GetDataSourceRun } from "./GetDataSourceRun.js";
export const GetDataSourceRunHttp = Layer.effect(GetDataSourceRun, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.GetDataSourceRun",
    operation: datazone.getDataSourceRun,
    actions: ["datazone:GetDataSourceRun"],
}));
//# sourceMappingURL=GetDataSourceRunHttp.js.map