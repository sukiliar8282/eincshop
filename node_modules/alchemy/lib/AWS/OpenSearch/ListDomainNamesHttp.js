import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Layer from "effect/Layer";
import { makeOpenSearchHttpBinding } from "./BindingHttp.js";
import { ListDomainNames } from "./ListDomainNames.js";
export const ListDomainNamesHttp = Layer.effect(ListDomainNames, makeOpenSearchHttpBinding({
    tag: "AWS.OpenSearch.ListDomainNames",
    operation: opensearch.listDomainNames,
    actions: ["es:ListDomainNames"],
}));
//# sourceMappingURL=ListDomainNamesHttp.js.map