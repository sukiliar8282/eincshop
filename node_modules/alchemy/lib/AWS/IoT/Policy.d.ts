import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * An IoT policy statement. Structurally similar to an IAM statement but
 * scopes IoT actions (`iot:Connect`, `iot:Publish`, `iot:Subscribe`,
 * `iot:Receive`) to topic / client ARNs.
 */
export interface IoTPolicyStatement {
    Effect: "Allow" | "Deny";
    Action: string | string[];
    Resource: string | string[];
}
export interface IoTPolicyDocument {
    Version?: string;
    Statement: IoTPolicyStatement[];
}
export interface PolicyProps {
    /**
     * Name of the policy. If omitted, a unique name is generated.
     * Changing it replaces the policy.
     */
    policyName?: string;
    /**
     * The JSON policy document, either as a string or a structured document.
     */
    policyDocument: string | IoTPolicyDocument;
    /**
     * User tags to attach to the policy.
     */
    tags?: Record<string, string>;
}
export interface Policy extends Resource<"AWS.IoT.Policy", PolicyProps, {
    /** The name of the policy. */
    policyName: string;
    /** The ARN of the policy. */
    policyArn: string;
}, never, Providers> {
}
/**
 * An AWS IoT policy that grants MQTT permissions (connect, publish,
 * subscribe, receive) to certificates and other principals.
 *
 * ### Creating a Policy
 * **Example:** Allow Publish and Subscribe
 * ```typescript
 * const policy = yield* Policy("device-policy", {
 *   policyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       { Effect: "Allow", Action: "iot:Connect", Resource: "*" },
 *       { Effect: "Allow", Action: ["iot:Publish", "iot:Receive"], Resource: "*" },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Policy: import("../../Resource.ts").ResourceClass<Policy>;
export declare const PolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<Policy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Policy.d.ts.map