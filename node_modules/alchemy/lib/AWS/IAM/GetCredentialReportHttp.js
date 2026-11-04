import * as iam from "@distilled.cloud/aws/iam";
import * as Layer from "effect/Layer";
import { makeIamHttpBinding } from "./BindingHttp.js";
import { GetCredentialReport } from "./GetCredentialReport.js";
export const GetCredentialReportHttp = Layer.effect(GetCredentialReport, makeIamHttpBinding({
    capability: "GetCredentialReport",
    iamActions: ["iam:GetCredentialReport"],
    operation: iam.getCredentialReport,
}));
//# sourceMappingURL=GetCredentialReportHttp.js.map