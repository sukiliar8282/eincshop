import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Layer from "effect/Layer";
import { makeOpenSearchHttpBinding } from "./BindingHttp.js";
import { GetCompatibleVersions } from "./GetCompatibleVersions.js";
export const GetCompatibleVersionsHttp = Layer.effect(GetCompatibleVersions, makeOpenSearchHttpBinding({
    tag: "AWS.OpenSearch.GetCompatibleVersions",
    operation: opensearch.getCompatibleVersions,
    actions: ["es:GetCompatibleVersions"],
}));
//# sourceMappingURL=GetCompatibleVersionsHttp.js.map