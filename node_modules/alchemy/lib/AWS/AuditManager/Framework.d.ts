import * as auditmanager from "@distilled.cloud/aws/auditmanager";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * A control referenced by a framework control set.
 */
export interface FrameworkControl {
    /**
     * The unique identifier of the control (standard or custom).
     */
    id: string;
}
/**
 * A grouping of related controls within a framework.
 */
export interface FrameworkControlSet {
    /**
     * Name of the control set.
     */
    name: string;
    /**
     * The controls in the set, referenced by control id.
     */
    controls?: FrameworkControl[];
}
export interface FrameworkProps {
    /**
     * Name of the custom framework.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * A description of the framework.
     */
    description?: string;
    /**
     * The compliance standard the framework relates to (e.g. `CIS`, `HIPAA`).
     */
    complianceType?: string;
    /**
     * The control sets that make up the framework. At least one set with at
     * least one control is required.
     */
    controlSets: FrameworkControlSet[];
    /**
     * Tags to associate with the framework.
     */
    tags?: Record<string, string>;
}
export interface Framework extends Resource<"AWS.AuditManager.Framework", FrameworkProps, {
    /**
     * Service-assigned unique identifier of the framework.
     */
    frameworkId: string;
    /**
     * ARN of the framework.
     */
    arn: string;
    /**
     * The framework's name.
     */
    name: string;
    /**
     * The framework's type — always `Custom` for frameworks Alchemy creates.
     */
    type: auditmanager.FrameworkType | undefined;
    /**
     * Current tags reported for the framework.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A custom assessment framework in AWS Audit Manager — a named collection
 * of control sets that assessments are created from.
 *
 * :::note
 * Audit Manager must be registered in the account (`RegisterAccount`)
 * before frameworks can be created.
 * :::
 * ### Creating Frameworks
 * **Example:** Framework from a Custom Control
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const control = yield* AWS.AuditManager.Control("AccessReview", {
 *   controlMappingSources: [{
 *     sourceName: "access-review-records",
 *     sourceSetUpOption: "Procedural_Controls_Mapping",
 *     sourceType: "MANUAL",
 *   }],
 * });
 *
 * const framework = yield* AWS.AuditManager.Framework("Compliance", {
 *   description: "Internal compliance framework",
 *   controlSets: [{
 *     name: "Access Management",
 *     controls: [{ id: control.controlId }],
 *   }],
 * });
 * ```
 *
 * @resource
 */
export declare const Framework: import("../../Resource.ts").ResourceClass<Framework>;
export declare const FrameworkProvider: () => import("effect/Layer").Layer<Provider.Provider<Framework>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Framework.d.ts.map