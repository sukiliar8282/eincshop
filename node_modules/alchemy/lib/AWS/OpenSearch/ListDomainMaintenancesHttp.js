import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Layer from "effect/Layer";
import { makeOpenSearchHttpBinding } from "./BindingHttp.js";
import { ListDomainMaintenances } from "./ListDomainMaintenances.js";
export const ListDomainMaintenancesHttp = Layer.effect(ListDomainMaintenances, makeOpenSearchHttpBinding({
    tag: "AWS.OpenSearch.ListDomainMaintenances",
    operation: opensearch.listDomainMaintenances,
    actions: ["es:ListDomainMaintenances"],
}));
//# sourceMappingURL=ListDomainMaintenancesHttp.js.map