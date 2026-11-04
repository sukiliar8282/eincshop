import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface IdentityPoolRoleAttachmentProps {
    /**
     * The ID of the identity pool. Changing this triggers a replacement.
     */
    identityPoolId: string;
    /**
     * The IAM role ARNs vended for authenticated and unauthenticated
     * identities. The roles must trust `cognito-identity.amazonaws.com` via
     * `sts:AssumeRoleWithWebIdentity`.
     */
    roles: {
        /** Role assumed by authenticated identities. */
        authenticated?: string;
        /** Role assumed by unauthenticated (guest) identities. */
        unauthenticated?: string;
    };
}
export interface IdentityPoolRoleAttachment extends Resource<"AWS.Cognito.IdentityPoolRoleAttachment", IdentityPoolRoleAttachmentProps, {
    /** The ID of the identity pool the roles are attached to. */
    identityPoolId: string;
    /** The attached role ARNs by identity type. */
    roles: {
        authenticated?: string;
        unauthenticated?: string;
    };
}, never, Providers> {
}
/**
 * Attaches the authenticated/unauthenticated IAM roles to an Amazon Cognito
 * identity pool. A singleton child of the pool — one attachment manages the
 * pool's role configuration.
 * ### Attaching Roles
 * **Example:** Authenticated Role
 * ```typescript
 * import * as Cognito from "alchemy/AWS/Cognito";
 *
 * const identities = yield* Cognito.IdentityPool("Identities", {});
 * const role = yield* IAM.Role("AuthenticatedRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Federated: "cognito-identity.amazonaws.com" },
 *         Action: "sts:AssumeRoleWithWebIdentity",
 *         Condition: {
 *           StringEquals: {
 *             "cognito-identity.amazonaws.com:aud": identities.identityPoolId,
 *           },
 *         },
 *       },
 *     ],
 *   },
 * });
 * yield* Cognito.IdentityPoolRoleAttachment("Roles", {
 *   identityPoolId: identities.identityPoolId,
 *   roles: { authenticated: role.roleArn },
 * });
 * ```
 *
 * @resource
 */
export declare const IdentityPoolRoleAttachment: import("../../Resource.ts").ResourceClass<IdentityPoolRoleAttachment>;
export declare const IdentityPoolRoleAttachmentProvider: () => import("effect/Layer").Layer<Provider.Provider<IdentityPoolRoleAttachment>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=IdentityPoolRoleAttachment.d.ts.map