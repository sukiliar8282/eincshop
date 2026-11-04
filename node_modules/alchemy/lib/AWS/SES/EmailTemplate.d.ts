import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface EmailTemplateProps {
    /**
     * The name of the template. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Changing the name
     * replaces the template.
     */
    templateName?: string;
    /**
     * The subject line, with optional `{{variable}}` personalization tags.
     */
    subject?: string;
    /**
     * The plain-text body, with optional `{{variable}}` personalization tags.
     */
    text?: string;
    /**
     * The HTML body, with optional `{{variable}}` personalization tags.
     */
    html?: string;
    /**
     * Tags to apply to the template. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface EmailTemplate extends Resource<"AWS.SES.EmailTemplate", EmailTemplateProps, {
    templateName: string;
    templateArn: string;
}, never, Providers> {
}
/**
 * An Amazon SES v2 email template — reusable subject/text/HTML content with
 * `{{variable}}` personalization tags, rendered server-side when you send
 * templated email.
 * ### Creating Templates
 * **Example:** Welcome Email Template
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const template = yield* SES.EmailTemplate("Welcome", {
 *   subject: "Welcome, {{name}}!",
 *   text: "Hi {{name}}, thanks for signing up.",
 *   html: "<h1>Hi {{name}}</h1><p>Thanks for signing up.</p>",
 * });
 * ```
 *
 * ### Sending Templated Email
 * **Example:** Send with Template Data
 * ```typescript
 * const sendEmail = yield* SES.SendEmail(identity);
 *
 * const result = yield* sendEmail({
 *   Destination: { ToAddresses: ["customer@example.com"] },
 *   Content: {
 *     Template: {
 *       TemplateName: "my-welcome-template",
 *       TemplateData: JSON.stringify({ name: "Ada" }),
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const EmailTemplate: import("../../Resource.ts").ResourceClass<EmailTemplate>;
export declare const EmailTemplateProvider: () => import("effect/Layer").Layer<Provider.Provider<EmailTemplate>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=EmailTemplate.d.ts.map