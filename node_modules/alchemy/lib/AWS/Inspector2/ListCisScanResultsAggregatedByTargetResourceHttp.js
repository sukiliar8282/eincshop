import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Layer from "effect/Layer";
import { makeInspector2AccountHttpBinding } from "./BindingHttp.js";
import { ListCisScanResultsAggregatedByTargetResource } from "./ListCisScanResultsAggregatedByTargetResource.js";
export const ListCisScanResultsAggregatedByTargetResourceHttp = Layer.effect(ListCisScanResultsAggregatedByTargetResource, makeInspector2AccountHttpBinding({
    tag: "AWS.Inspector2.ListCisScanResultsAggregatedByTargetResource",
    operation: inspector2.listCisScanResultsAggregatedByTargetResource,
    actions: ["inspector2:ListCisScanResultsAggregatedByTargetResource"],
}));
//# sourceMappingURL=ListCisScanResultsAggregatedByTargetResourceHttp.js.map