import * as acmpca from "@distilled.cloud/aws/acm-pca";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PermissionProps {
    /**
     * The ARN of the private certificate authority the permission is
     * granted on. Changing this replaces the permission.
     */
    certificateAuthorityArn: string;
    /**
     * The Amazon Web Services service principal receiving the permission.
     * Currently the only supported value is `acm.amazonaws.com`.
     * Changing this replaces the permission.
     * @default "acm.amazonaws.com"
     */
    principal?: string;
    /**
     * The actions the principal may perform against the CA. For the ACM
     * principal AWS requires all three actions — a subset is rejected with
     * `ValidationException: Permissions must contain all three actions
     * [IssueCertificate, GetCertificate, ListPermissions] for ACM to
     * perform renewals.`
     * @default ["IssueCertificate", "GetCertificate", "ListPermissions"]
     */
    actions?: acmpca.ActionType[];
    /**
     * The account that owns the CA (for CAs shared into this account).
     * Changing this replaces the permission.
     */
    sourceAccount?: string;
}
export interface Permission extends Resource<"AWS.ACMPCA.Permission", PermissionProps, {
    /** The ARN of the CA the permission is granted on. */
    certificateAuthorityArn: string;
    /** The service principal the permission is granted to. */
    principal: string;
}, never, Providers> {
}
/**
 * A permission on a private CA granted to the Certificate Manager (ACM)
 * service principal, allowing ACM to automatically issue and renew ACM
 * certificates signed by the CA.
 * ### Granting Permissions
 * **Example:** Allow ACM to auto-renew certificates
 * ```typescript
 * import * as ACMPCA from "alchemy/AWS/ACMPCA";
 *
 * const permission = yield* ACMPCA.Permission("AcmRenewal", {
 *   certificateAuthorityArn: ca.certificateAuthorityArn,
 * });
 * ```
 *
 * **Example:** Restrict the granted actions
 * ```typescript
 * const permission = yield* ACMPCA.Permission("AcmIssueOnly", {
 *   certificateAuthorityArn: ca.certificateAuthorityArn,
 *   actions: ["IssueCertificate", "GetCertificate"],
 * });
 * ```
 *
 * @resource
 */
export declare const Permission: import("../../Resource.ts").ResourceClass<Permission>;
export declare const PermissionProvider: () => import("effect/Layer").Layer<Provider.Provider<Permission>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Permission.d.ts.map