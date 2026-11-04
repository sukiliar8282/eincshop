import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { ListFindingAggregators } from "./ListFindingAggregators.js";
export const ListFindingAggregatorsHttp = Layer.effect(ListFindingAggregators, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.ListFindingAggregators",
    operation: securityhub.listFindingAggregators,
    actions: ["securityhub:ListFindingAggregators"],
}));
//# sourceMappingURL=ListFindingAggregatorsHttp.js.map