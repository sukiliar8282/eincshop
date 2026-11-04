import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Layer from "effect/Layer";
import { makeOpenSearchHttpBinding } from "./BindingHttp.js";
import { GetUpgradeHistory } from "./GetUpgradeHistory.js";
export const GetUpgradeHistoryHttp = Layer.effect(GetUpgradeHistory, makeOpenSearchHttpBinding({
    tag: "AWS.OpenSearch.GetUpgradeHistory",
    operation: opensearch.getUpgradeHistory,
    actions: ["es:GetUpgradeHistory"],
}));
//# sourceMappingURL=GetUpgradeHistoryHttp.js.map