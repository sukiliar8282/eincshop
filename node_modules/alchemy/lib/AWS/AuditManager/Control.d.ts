import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The keyword used to search evidence for a control mapping source.
 */
export interface ControlSourceKeyword {
    /**
     * How the keyword is entered (`SELECT_FROM_LIST`, `UPLOAD_FILE`, or
     * `INPUT_TEXT`).
     */
    keywordInputType?: auditmanager.KeywordInputType;
    /**
     * The value of the keyword — e.g. a CloudTrail event name, a Config rule
     * name, or a Security Hub control name.
     */
    keywordValue?: string;
}
/**
 * A data source Audit Manager collects evidence from for a custom control.
 */
export interface ControlMappingSourceProps {
    /**
     * Name of the evidence source.
     */
    sourceName: string;
    /**
     * A description of the source.
     */
    sourceDescription?: string;
    /**
     * How the source collects evidence: `System_Controls_Mapping` (automated)
     * or `Procedural_Controls_Mapping` (manual).
     */
    sourceSetUpOption?: auditmanager.SourceSetUpOption;
    /**
     * The evidence collection method (`AWS_Cloudtrail`, `AWS_Config`,
     * `AWS_Security_Hub`, `AWS_API_Call`, or `MANUAL`).
     */
    sourceType?: auditmanager.SourceType;
    /**
     * The keyword that scopes what evidence the source collects.
     */
    sourceKeyword?: ControlSourceKeyword;
    /**
     * How often automated evidence is collected (`DAILY`, `WEEKLY`, or
     * `MONTHLY`).
     */
    sourceFrequency?: auditmanager.SourceFrequency;
    /**
     * Instructions shown to users when evidence collection fails.
     */
    troubleshootingText?: string;
}
export interface ControlProps {
    /**
     * Name of the custom control.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * A description of the control's purpose.
     */
    description?: string;
    /**
     * Steps for testing the control.
     */
    testingInformation?: string;
    /**
     * Title of the recommended action plan when the control isn't met.
     */
    actionPlanTitle?: string;
    /**
     * Recommended actions when the control isn't met.
     */
    actionPlanInstructions?: string;
    /**
     * The data sources Audit Manager collects evidence from for this control.
     */
    controlMappingSources: ControlMappingSourceProps[];
    /**
     * Tags to associate with the control.
     */
    tags?: Record<string, string>;
}
export interface Control extends Resource<"AWS.AuditManager.Control", ControlProps, {
    /**
     * Service-assigned unique identifier of the control.
     */
    controlId: string;
    /**
     * ARN of the control.
     */
    arn: string;
    /**
     * The control's name.
     */
    name: string;
    /**
     * The control's type — always `Custom` for controls Alchemy creates.
     */
    type: auditmanager.ControlType | undefined;
    /**
     * Lifecycle state of the control (`ACTIVE` or `END_OF_SUPPORT`).
     */
    state: auditmanager.ControlState | undefined;
    /**
     * Current tags reported for the control.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A custom control in AWS Audit Manager — a compliance requirement paired
 * with the data sources (CloudTrail, Config, Security Hub, API calls, or
 * manual evidence) Audit Manager collects evidence from to demonstrate it.
 *
 * :::note
 * Audit Manager must be registered in the account (`RegisterAccount`)
 * before controls can be created.
 * :::
 * ### Creating Controls
 * **Example:** Manual-Evidence Control
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const control = yield* AWS.AuditManager.Control("AccessReview", {
 *   description: "Quarterly review of privileged access",
 *   controlMappingSources: [{
 *     sourceName: "access-review-records",
 *     sourceSetUpOption: "Procedural_Controls_Mapping",
 *     sourceType: "MANUAL",
 *   }],
 * });
 * ```
 *
 * **Example:** CloudTrail-Backed Control
 * ```typescript
 * const control = yield* AWS.AuditManager.Control("RootLoginMonitor", {
 *   description: "Detects console logins by the root user",
 *   controlMappingSources: [{
 *     sourceName: "root-console-logins",
 *     sourceSetUpOption: "System_Controls_Mapping",
 *     sourceType: "AWS_Cloudtrail",
 *     sourceKeyword: {
 *       keywordInputType: "SELECT_FROM_LIST",
 *       keywordValue: "ConsoleLogin",
 *     },
 *     sourceFrequency: "DAILY",
 *   }],
 * });
 * ```
 *
 * @resource
 */
export declare const Control: import("../../Resource.ts").ResourceClass<Control>;
export declare const ControlProvider: () => import("effect/Layer").Layer<Provider.Provider<Control>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Control.d.ts.map