import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { IamAction } from "./actions.generated.ts";
export type { IamAction } from "./actions.generated.ts";
export { stringifyPolicyDocument } from "./common.ts";
export interface PolicyDocument {
    Version: "2012-10-17";
    Statement: PolicyStatement[];
}
export interface PolicyStatement {
    Effect: "Allow" | "Deny";
    Sid?: string;
    Action?: IamAction[] | string[];
    Resource?: string | string[];
    Condition?: Record<string, Record<string, string | string[]>>;
    Principal?: Record<string, string | string[]>;
    NotPrincipal?: Record<string, string | string[]>;
    NotAction?: string[];
    NotResource?: string[];
}
/**
 * A single statement in a Service Control Policy (SCP) or Resource Control
 * Policy (RCP) — the restricted IAM dialect accepted by AWS Organizations.
 *
 * SCP statements never carry a `Principal`/`NotPrincipal` (they apply to the
 * accounts the policy is attached to), and Allow statements are further
 * restricted by Organizations at write time (`Resource` must be `"*"`, no
 * `Condition`, no `NotAction`). This interface narrows {@link PolicyStatement}
 * to the SCP-legal field set; the Allow-statement value restrictions are
 * enforced by the Organizations API.
 */
export interface ServiceControlPolicyStatement {
    Sid?: string;
    Effect: "Allow" | "Deny";
    Action?: IamAction[] | string[];
    NotAction?: string[];
    Resource?: string | string[];
    NotResource?: string[];
    Condition?: Record<string, Record<string, string | string[]>>;
}
/**
 * A Service Control Policy document — the SCP-legal subset of
 * {@link PolicyDocument} used by AWS Organizations policies
 * (`SERVICE_CONTROL_POLICY` / `RESOURCE_CONTROL_POLICY`).
 */
export interface ServiceControlPolicyDocument {
    Version: "2012-10-17";
    Statement: ServiceControlPolicyStatement[];
}
/**
 * Canonicalize an IAM policy document for drift comparison.
 *
 * Accepts either the raw JSON string a cloud API returned (IAM returns
 * URL-encoded documents; both encoded and plain strings are handled) or an
 * in-memory document object, and produces a deterministic string — object keys
 * sorted recursively, arrays kept in order, no whitespace — so two equivalent
 * documents compare equal regardless of key ordering or encoding.
 *
 * Single-element arrays are collapsed to their element: the IAM policy
 * grammar treats `["x"]` and `"x"` as equivalent in every list-valued
 * position (`Action`, `Resource`, principal values, condition values, even
 * `Statement` itself), and several AWS services (e.g. Secrets Manager)
 * store the scalar form — without collapsing, a typed document that uses
 * arrays would spuriously diff against the stored policy on every deploy.
 *
 * Unparseable strings are returned unchanged so a diff still fires (and shows
 * the offending value) instead of throwing inside a provider.
 */
export declare const normalizePolicyDocument: (json: string | object) => string;
export type PolicyName = string;
export type PolicyArn = `arn:aws:iam::${AccountID}:policy/${string}`;
export interface PolicyProps {
    /**
     * Name of the managed policy. If omitted, a deterministic name is generated.
     */
    policyName?: string;
    /**
     * Optional IAM path prefix for the policy.
     * @default "/"
     */
    path?: string;
    /**
     * The JSON IAM policy document.
     */
    policyDocument: PolicyDocument;
    /**
     * Optional description for the policy.
     */
    description?: string;
    /**
     * User-defined tags to apply to the managed policy.
     */
    tags?: Record<string, string>;
}
export interface Policy extends Resource<"AWS.IAM.Policy", PolicyProps, {
    /** The ARN of the policy. */
    policyArn: PolicyArn;
    /** The name of the policy. */
    policyName: PolicyName;
    /** The stable unique ID of the policy. */
    policyId: string | undefined;
    /** The IAM path of the policy. */
    path: string | undefined;
    /** The version currently set as the default (e.g. `v2`). */
    defaultVersionId: string | undefined;
    /** How many IAM identities the policy is attached to. */
    attachmentCount: number | undefined;
    /** How many IAM identities use the policy as a permissions boundary. */
    permissionsBoundaryUsageCount: number | undefined;
    /** Whether the policy can be attached to IAM identities. */
    isAttachable: boolean | undefined;
    /** The description of the policy. */
    description: string | undefined;
    /** The policy document of the default version. */
    policyDocument: PolicyDocument;
    /** The tags applied to the policy. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A customer-managed IAM policy.
 *
 * `Policy` owns the lifecycle of the policy metadata and its default version,
 * rotating versions on updates while keeping the current document attached to a
 * stable policy ARN.
 * ### Creating Policies
 * **Example:** Managed Policy
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
 * ```
 *
 * @resource
 */
export declare const Policy: import("../../Resource.ts").ResourceClass<Policy>;
export declare const PolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<Policy>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Policy.d.ts.map