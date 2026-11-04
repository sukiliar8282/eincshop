import * as iam from "@distilled.cloud/aws/iam";
import * as Layer from "effect/Layer";
import { makeIamHttpBinding } from "./BindingHttp.js";
import { GenerateServiceLastAccessedDetails } from "./GenerateServiceLastAccessedDetails.js";
export const GenerateServiceLastAccessedDetailsHttp = Layer.effect(GenerateServiceLastAccessedDetails, makeIamHttpBinding({
    capability: "GenerateServiceLastAccessedDetails",
    iamActions: ["iam:GenerateServiceLastAccessedDetails"],
    operation: iam.generateServiceLastAccessedDetails,
}));
//# sourceMappingURL=GenerateServiceLastAccessedDetailsHttp.js.map