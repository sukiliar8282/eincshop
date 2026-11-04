import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { ListComplianceStatus } from "./ListComplianceStatus.js";
export const ListComplianceStatusHttp = Layer.effect(ListComplianceStatus, makeFmsHttpBinding({
    capability: "ListComplianceStatus",
    iamActions: ["fms:ListComplianceStatus"],
    operation: fms.listComplianceStatus,
}));
//# sourceMappingURL=ListComplianceStatusHttp.js.map