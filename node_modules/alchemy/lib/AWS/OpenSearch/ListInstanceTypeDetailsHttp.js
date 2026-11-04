import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Layer from "effect/Layer";
import { makeOpenSearchHttpBinding } from "./BindingHttp.js";
import { ListInstanceTypeDetails } from "./ListInstanceTypeDetails.js";
export const ListInstanceTypeDetailsHttp = Layer.effect(ListInstanceTypeDetails, makeOpenSearchHttpBinding({
    tag: "AWS.OpenSearch.ListInstanceTypeDetails",
    operation: opensearch.listInstanceTypeDetails,
    actions: ["es:ListInstanceTypeDetails"],
}));
//# sourceMappingURL=ListInstanceTypeDetailsHttp.js.map