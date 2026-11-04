import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Layer from "effect/Layer";
import { makeOpenSearchHttpBinding } from "./BindingHttp.js";
import { ListVersions } from "./ListVersions.js";
export const ListVersionsHttp = Layer.effect(ListVersions, makeOpenSearchHttpBinding({
    tag: "AWS.OpenSearch.ListVersions",
    operation: opensearch.listVersions,
    actions: ["es:ListVersions"],
}));
//# sourceMappingURL=ListVersionsHttp.js.map