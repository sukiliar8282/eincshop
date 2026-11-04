import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Layer from "effect/Layer";
import { makeSendScopedHttpBinding } from "./BindingHttp.js";
import { SendBulkEmail } from "./SendBulkEmail.js";
export const SendBulkEmailHttp = Layer.effect(SendBulkEmail, makeSendScopedHttpBinding({
    tag: "AWS.SES.SendBulkEmail",
    operation: sesv2.sendBulkEmail,
    actions: [
        "ses:SendEmail",
        "ses:SendBulkEmail",
        "ses:SendTemplatedEmail",
        "ses:SendBulkTemplatedEmail",
    ],
}));
//# sourceMappingURL=SendBulkEmailHttp.js.map