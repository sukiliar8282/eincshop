import * as iam from "@distilled.cloud/aws/iam";
import * as Layer from "effect/Layer";
import { makeIamHttpBinding } from "./BindingHttp.js";
import { GetAccountSummary } from "./GetAccountSummary.js";
export const GetAccountSummaryHttp = Layer.effect(GetAccountSummary, makeIamHttpBinding({
    capability: "GetAccountSummary",
    iamActions: ["iam:GetAccountSummary"],
    operation: iam.getAccountSummary,
}));
//# sourceMappingURL=GetAccountSummaryHttp.js.map