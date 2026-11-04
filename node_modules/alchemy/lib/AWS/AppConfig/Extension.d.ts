import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The workflow points at which AppConfig invokes an extension's actions.
 * `PRE_*` action points run synchronously and can validate or modify the
 * operation; `ON_*` action points are notifications fired as a deployment
 * progresses.
 */
export type ExtensionActionPoint = "PRE_CREATE_HOSTED_CONFIGURATION_VERSION" | "PRE_START_DEPLOYMENT" | "AT_DEPLOYMENT_TICK" | "ON_DEPLOYMENT_START" | "ON_DEPLOYMENT_STEP" | "ON_DEPLOYMENT_BAKING" | "ON_DEPLOYMENT_COMPLETE" | "ON_DEPLOYMENT_ROLLED_BACK";
/**
 * A single action AppConfig performs when the owning action point fires.
 */
export interface ExtensionAction {
    /** Name of the action (unique within the extension). */
    name: string;
    /** Description of what the action does. */
    description?: string;
    /**
     * ARN of the integration target: a Lambda function, SNS topic, SQS queue,
     * or EventBridge event bus.
     */
    uri: string;
    /**
     * ARN of an IAM role AppConfig assumes to invoke the target. Required for
     * Lambda, SNS, and SQS targets; not used for EventBridge targets.
     */
    roleArn?: string;
}
/**
 * A parameter the extension accepts. Values are supplied per association via
 * {@link ExtensionAssociationProps.parameters}.
 */
export interface ExtensionParameter {
    /** Description of the parameter. */
    description?: string;
    /** Whether every association must supply a value. */
    required?: boolean;
    /** Whether the value may be supplied at deployment time. */
    dynamic?: boolean;
}
export interface ExtensionProps {
    /**
     * Name of the extension. If omitted, a deterministic physical name is
     * generated. Changing the name replaces the extension.
     */
    extensionName?: string;
    /**
     * Description of the extension.
     */
    description?: string;
    /**
     * The actions to perform, keyed by the action point that triggers them.
     */
    actions: {
        [P in ExtensionActionPoint]?: ExtensionAction[];
    };
    /**
     * Parameters accepted by the extension, keyed by parameter name. Values are
     * supplied when the extension is associated with a resource.
     */
    parameters?: Record<string, ExtensionParameter>;
    /**
     * User-defined tags for the extension.
     */
    tags?: Record<string, string>;
}
export interface Extension extends Resource<"AWS.AppConfig.Extension", ExtensionProps, {
    extensionId: string;
    extensionName: string;
    extensionArn: string;
    versionNumber: number;
}, never, Providers> {
}
/**
 * An AWS AppConfig extension — a set of actions AppConfig performs at
 * specific points of the configuration workflow (before a version is
 * created, before/while/after a deployment). Actions can invoke Lambda
 * functions, publish to SNS/SQS, or emit EventBridge events.
 *
 * Associate the extension with an application, environment, or configuration
 * profile using {@link ExtensionAssociation}.
 *
 * ### Creating an Extension
 * **Example:** Notify a Lambda when a deployment completes
 * ```typescript
 * const extension = yield* AppConfig.Extension("DeployHook", {
 *   actions: {
 *     ON_DEPLOYMENT_COMPLETE: [
 *       {
 *         name: "notify",
 *         uri: fn.functionArn,
 *         roleArn: role.roleArn,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * **Example:** Validate content before a deployment starts
 * ```typescript
 * const extension = yield* AppConfig.Extension("PreflightCheck", {
 *   description: "Reject deployments outside business hours",
 *   actions: {
 *     PRE_START_DEPLOYMENT: [
 *       { name: "preflight", uri: fn.functionArn, roleArn: role.roleArn },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Extension: import("../../Resource.ts").ResourceClass<Extension>;
export declare const ExtensionProvider: () => import("effect/Layer").Layer<Provider.Provider<Extension>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Extension.d.ts.map