import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface WebACLAssociationProps {
    /**
     * ARN of the `REGIONAL` web ACL to associate.
     *
     * Changing the web ACL re-associates the resource in place
     * (`AssociateWebACL` overwrites any existing association).
     */
    webAclArn: string;
    /**
     * ARN of the regional resource to protect — an Application Load
     * Balancer, API Gateway REST API stage, AppSync GraphQL API, Cognito
     * user pool, App Runner service, Amplify application or Verified Access
     * instance. Changing the resource replaces the association.
     *
     * CloudFront distributions are NOT associated this way — set the
     * distribution's `webAclId` property to the web ACL's ARN instead.
     */
    resourceArn: string;
}
export interface WebACLAssociation extends Resource<"AWS.WAFv2.WebACLAssociation", WebACLAssociationProps, {
    /**
     * ARN of the associated web ACL.
     */
    webAclArn: string;
    /**
     * ARN of the protected resource.
     */
    resourceArn: string;
}, never, Providers> {
}
/**
 * Associates a `REGIONAL` AWS WAFv2 {@link WebACL} with a regional resource
 * (ALB, API Gateway stage, AppSync API, Cognito user pool, App Runner
 * service, Amplify app, Verified Access instance) to protect it.
 *
 * A resource can have at most one web ACL association; associating a
 * different web ACL overwrites the previous association in place.
 * CloudFront distributions are protected by setting
 * `Distribution.webAclId` instead — never through this resource.
 *
 * ### Associating Web ACLs
 * **Example:** Protect a Cognito User Pool
 * ```typescript
 * const pool = yield* AWS.Cognito.UserPool("Users", {});
 *
 * const acl = yield* AWS.WAFv2.WebACL("PoolFirewall", {
 *   defaultAction: { Allow: {} },
 * });
 *
 * const association = yield* AWS.WAFv2.WebACLAssociation("PoolAssociation", {
 *   webAclArn: acl.webAclArn,
 *   resourceArn: pool.userPoolArn,
 * });
 * ```
 *
 * @resource
 */
export declare const WebACLAssociation: import("../../Resource.ts").ResourceClass<WebACLAssociation>;
export declare const WebACLAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<WebACLAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=WebACLAssociation.d.ts.map