import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Layer from "effect/Layer";
import { makeVerificationScopedHttpBinding } from "./BindingHttp.js";
import { SendCustomVerificationEmail } from "./SendCustomVerificationEmail.js";
export const SendCustomVerificationEmailHttp = Layer.effect(SendCustomVerificationEmail, makeVerificationScopedHttpBinding({
    tag: "AWS.SES.SendCustomVerificationEmail",
    operation: sesv2.sendCustomVerificationEmail,
    actions: ["ses:SendCustomVerificationEmail"],
}));
//# sourceMappingURL=SendCustomVerificationEmailHttp.js.map