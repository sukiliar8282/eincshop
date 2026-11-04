import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Layer from "effect/Layer";
import { makeOpenSearchHttpBinding } from "./BindingHttp.js";
import { GetUpgradeStatus } from "./GetUpgradeStatus.js";
export const GetUpgradeStatusHttp = Layer.effect(GetUpgradeStatus, makeOpenSearchHttpBinding({
    tag: "AWS.OpenSearch.GetUpgradeStatus",
    operation: opensearch.getUpgradeStatus,
    actions: ["es:GetUpgradeStatus"],
}));
//# sourceMappingURL=GetUpgradeStatusHttp.js.map