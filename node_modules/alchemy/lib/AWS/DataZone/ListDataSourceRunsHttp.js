import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { ListDataSourceRuns } from "./ListDataSourceRuns.js";
export const ListDataSourceRunsHttp = Layer.effect(ListDataSourceRuns, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.ListDataSourceRuns",
    operation: datazone.listDataSourceRuns,
    actions: ["datazone:ListDataSourceRuns"],
}));
//# sourceMappingURL=ListDataSourceRunsHttp.js.map