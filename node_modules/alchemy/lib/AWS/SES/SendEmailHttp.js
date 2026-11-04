import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Layer from "effect/Layer";
import { makeSendScopedHttpBinding } from "./BindingHttp.js";
import { SendEmail } from "./SendEmail.js";
export const SendEmailHttp = Layer.effect(SendEmail, makeSendScopedHttpBinding({
    tag: "AWS.SES.SendEmail",
    operation: sesv2.sendEmail,
    actions: [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:SendTemplatedEmail",
        "ses:SendBulkTemplatedEmail",
    ],
}));
//# sourceMappingURL=SendEmailHttp.js.map