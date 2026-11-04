import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Layer from "effect/Layer";
import { makeOpenSearchHttpBinding } from "./BindingHttp.js";
import { GetDomainMaintenanceStatus } from "./GetDomainMaintenanceStatus.js";
export const GetDomainMaintenanceStatusHttp = Layer.effect(GetDomainMaintenanceStatus, makeOpenSearchHttpBinding({
    tag: "AWS.OpenSearch.GetDomainMaintenanceStatus",
    operation: opensearch.getDomainMaintenanceStatus,
    actions: ["es:GetDomainMaintenanceStatus"],
}));
//# sourceMappingURL=GetDomainMaintenanceStatusHttp.js.map