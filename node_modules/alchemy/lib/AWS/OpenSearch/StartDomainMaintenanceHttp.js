import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Layer from "effect/Layer";
import { makeOpenSearchHttpBinding } from "./BindingHttp.js";
import { StartDomainMaintenance } from "./StartDomainMaintenance.js";
export const StartDomainMaintenanceHttp = Layer.effect(StartDomainMaintenance, makeOpenSearchHttpBinding({
    tag: "AWS.OpenSearch.StartDomainMaintenance",
    operation: opensearch.startDomainMaintenance,
    actions: ["es:StartDomainMaintenance"],
}));
//# sourceMappingURL=StartDomainMaintenanceHttp.js.map