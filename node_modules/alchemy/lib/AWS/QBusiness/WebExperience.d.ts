import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type WebExperienceStatus = qbusiness.WebExperienceStatus;
export interface WebExperienceProps {
    /**
     * The identifier of the Amazon Q Business application the web experience
     * fronts. Changing it replaces the web experience.
     */
    applicationId: string;
    /**
     * The title displayed in the web experience header.
     */
    title?: string;
    /**
     * The subtitle displayed under the title.
     */
    subtitle?: string;
    /**
     * A custom welcome message displayed when a conversation starts.
     */
    welcomeMessage?: string;
    /**
     * Whether sample chat prompts are shown to end users.
     */
    samplePromptsControlMode?: qbusiness.WebExperienceSamplePromptsControlMode;
    /**
     * Website domains allowed to embed the web experience.
     */
    origins?: string[];
    /**
     * ARN of the IAM role the web experience assumes to talk to the
     * application on behalf of end users.
     */
    roleArn?: string;
    /**
     * External identity-provider settings (SAML or OIDC) for the web
     * experience.
     */
    identityProviderConfiguration?: qbusiness.IdentityProviderConfiguration;
    /**
     * Which browser extensions (Chrome, Firefox) may connect to the web
     * experience.
     */
    browserExtensionConfiguration?: qbusiness.BrowserExtensionConfiguration;
    /**
     * Custom logo/font/CSS customization for the web experience.
     */
    customizationConfiguration?: qbusiness.CustomizationConfiguration;
    /**
     * Tags to associate with the web experience.
     */
    tags?: Record<string, string>;
}
export interface WebExperience extends Resource<"AWS.QBusiness.WebExperience", WebExperienceProps, {
    /**
     * Service-assigned unique identifier of the web experience (unique
     * within its application).
     */
    webExperienceId: string;
    /**
     * The identifier of the application the web experience belongs to.
     */
    applicationId: string;
    /**
     * ARN of the web experience.
     */
    webExperienceArn: string;
    /**
     * The AWS-hosted URL end users open to chat with the application.
     */
    defaultEndpoint: string | undefined;
    /**
     * Current lifecycle status of the web experience.
     */
    status: WebExperienceStatus | undefined;
    /**
     * Current tags reported for the web experience.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Q Business web experience — the hosted chat UI end users open
 * to converse with an application.
 *
 * ### Creating Web Experiences
 * **Example:** Basic Web Experience
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const web = yield* AWS.QBusiness.WebExperience("Chat", {
 *   applicationId: app.applicationId,
 *   title: "Company Assistant",
 *   welcomeMessage: "Ask me anything about our docs.",
 * });
 * ```
 *
 * **Example:** Embeddable Web Experience
 * ```typescript
 * const web = yield* AWS.QBusiness.WebExperience("Chat", {
 *   applicationId: app.applicationId,
 *   origins: ["https://intranet.example.com"],
 *   samplePromptsControlMode: "ENABLED",
 * });
 * ```
 *
 * @resource
 */
export declare const WebExperience: import("../../Resource.ts").ResourceClass<WebExperience>;
declare const WebExperienceProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "WebExperienceProvisioningFailed";
} & Readonly<A>;
/**
 * A web experience whose asynchronous provisioning converged to the
 * terminal `FAILED` status.
 */
export declare class WebExperienceProvisioningFailed extends WebExperienceProvisioningFailed_base<{
    readonly webExperienceId: string;
    readonly message: string | undefined;
}> {
}
export declare const WebExperienceProvider: () => import("effect/Layer").Layer<Provider.Provider<WebExperience>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=WebExperience.d.ts.map