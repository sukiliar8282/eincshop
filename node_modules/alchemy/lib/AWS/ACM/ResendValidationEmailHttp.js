import * as acm from "@distilled.cloud/aws/acm";
import * as Layer from "effect/Layer";
import { makeAcmCertificateHttpBinding } from "./BindingHttp.js";
import { ResendValidationEmail, } from "./ResendValidationEmail.js";
export const ResendValidationEmailHttp = Layer.effect(ResendValidationEmail, makeAcmCertificateHttpBinding({
    capability: "ResendValidationEmail",
    iamActions: ["acm:ResendValidationEmail"],
    operation: acm.resendValidationEmail,
}));
//# sourceMappingURL=ResendValidationEmailHttp.js.map