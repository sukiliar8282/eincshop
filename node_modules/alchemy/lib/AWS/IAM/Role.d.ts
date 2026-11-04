import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { PolicyDocument, PolicyStatement } from "./Policy.ts";
export type RoleName = string;
export type RoleArn = `arn:aws:iam::${AccountID}:role/${RoleName}`;
export interface RoleProps {
    /**
     * Name of the role. If omitted, a unique name will be generated.
     */
    roleName?: string;
    /**
     * Optional IAM path prefix for the role.
     * @default "/"
     */
    path?: string;
    /**
     * IAM trust policy for the role. Optional when a binding contributes the
     * trust statements (see the `assumeRolePolicyStatements` binding field) — at
     * least one of the two must supply a statement.
     */
    assumeRolePolicyDocument?: PolicyDocument;
    /**
     * Managed policy ARNs to attach to the role.
     */
    managedPolicyArns?: string[];
    /**
     * Inline policies keyed by policy name.
     */
    inlinePolicies?: Record<string, PolicyDocument>;
    /**
     * Optional description for the role.
     */
    description?: string;
    /**
     * Maximum session duration, e.g. `"4 hours"` or `Duration.hours(4)`.
     * Sent to IAM as whole seconds (a bare number is milliseconds).
     */
    maxSessionDuration?: Duration.Input;
    /**
     * Optional managed policy ARN used as the permissions boundary.
     */
    permissionsBoundary?: string;
    /**
     * User-defined tags to apply to the role.
     */
    tags?: Record<string, string>;
}
export interface Role extends Resource<"AWS.IAM.Role", RoleProps, {
    /** The ARN of the role. */
    roleArn: RoleArn;
    /** The name of the role. */
    roleName: RoleName;
    /** The stable unique ID of the role. */
    roleId: string | undefined;
    /** The IAM path of the role. */
    path: string | undefined;
    /** The trust policy in effect for the role. */
    assumeRolePolicyDocument: PolicyDocument;
    /** Managed policy ARNs attached to the role. */
    managedPolicyArns: string[];
    /** Inline policies embedded in the role, keyed by policy name. */
    inlinePolicies: Record<string, PolicyDocument>;
    /** The description of the role. */
    description: string | undefined;
    /** The maximum session duration, in seconds. */
    maxSessionDuration: number | undefined;
    /** The managed policy ARN used as the permissions boundary, if any. */
    permissionsBoundary: string | undefined;
    /** The tags applied to the role. */
    tags: Record<string, string>;
}, {
    /**
     * IAM policy statements contributed by bindings (e.g. a consumer granting
     * this role access to a resource). They are folded into a managed inline
     * policy named `alchemy-bindings` on the role.
     */
    policyStatements?: PolicyStatement[];
    /**
     * Trust-policy (assume-role) statements contributed by bindings — e.g. a
     * consumer declaring which service principal may assume this role. They are
     * merged into the role's `assumeRolePolicyDocument`.
     */
    assumeRolePolicyStatements?: PolicyStatement[];
}, Providers> {
}
/**
 * An IAM role for AWS services and runtimes.
 * ### Creating Roles
 * **Example:** ECS Task Role
 * ```typescript
 * const role = yield* Role("TaskRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "ecs-tasks.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 * });
 * ```
 *
 * ### Granting Permissions
 * **Example:** Attach a Customer-Managed Policy
 * ```typescript
 * const policy = yield* Policy("AppPolicy", {
 *   policyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Action: ["s3:GetObject"],
 *       Resource: ["arn:aws:s3:::my-bucket/*"],
 *     }],
 *   },
 * });
 *
 * const role = yield* Role("AppRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "lambda.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 *   managedPolicyArns: [policy.policyArn],
 *   inlinePolicies: {
 *     Logs: {
 *       Version: "2012-10-17",
 *       Statement: [{
 *         Effect: "Allow",
 *         Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
 *         Resource: ["*"],
 *       }],
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Role: import("../../Resource.ts").ResourceClass<Role>;
export declare const RoleProvider: () => import("effect/Layer").Layer<Provider.Provider<Role>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Role.d.ts.map