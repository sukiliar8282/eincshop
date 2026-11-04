import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { StartDataSourceRun } from "./StartDataSourceRun.js";
export const StartDataSourceRunHttp = Layer.effect(StartDataSourceRun, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.StartDataSourceRun",
    operation: datazone.startDataSourceRun,
    actions: ["datazone:StartDataSourceRun"],
}));
//# sourceMappingURL=StartDataSourceRunHttp.js.map