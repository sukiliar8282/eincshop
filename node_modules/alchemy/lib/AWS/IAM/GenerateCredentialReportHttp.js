import * as iam from "@distilled.cloud/aws/iam";
import * as Layer from "effect/Layer";
import { makeIamHttpBinding } from "./BindingHttp.js";
import { GenerateCredentialReport } from "./GenerateCredentialReport.js";
export const GenerateCredentialReportHttp = Layer.effect(GenerateCredentialReport, makeIamHttpBinding({
    capability: "GenerateCredentialReport",
    iamActions: ["iam:GenerateCredentialReport"],
    operation: iam.generateCredentialReport,
}));
//# sourceMappingURL=GenerateCredentialReportHttp.js.map