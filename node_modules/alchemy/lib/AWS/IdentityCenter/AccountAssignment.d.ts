import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AccountAssignmentProps {
    /**
     * Explicit Identity Center instance ARN.
     * If omitted, Alchemy adopts the only visible instance.
     */
    instanceArn?: string;
    /**
     * Permission set ARN to assign.
     */
    permissionSetArn: string;
    /**
     * Principal ID from the IAM Identity Center identity store.
     */
    principalId: string;
    /**
     * Principal type.
     */
    principalType: "USER" | "GROUP";
    /**
     * Target AWS account ID.
     */
    targetId: string;
}
export interface AccountAssignment extends Resource<"AWS.IdentityCenter.AccountAssignment", AccountAssignmentProps, {
    /** The Identity Center instance the assignment lives in. */
    instanceArn: string;
    /** The permission set provisioned to the target. */
    permissionSetArn: string;
    /** The user or group ID that was assigned. */
    principalId: string;
    /** Whether the principal is a `USER` or `GROUP`. */
    principalType: "USER" | "GROUP";
    /** The AWS account ID the assignment targets. */
    targetId: string;
    /** The target type (`AWS_ACCOUNT`). */
    targetType: "AWS_ACCOUNT";
}, never, Providers> {
}
/**
 * Assigns an IAM Identity Center permission set to a user or group in an AWS
 * account.
 * ### Creating Assignments
 * **Example:** Assign A Group To A Workload Account
 * ```typescript
 * const assignment = yield* AccountAssignment("ProdAdminAssignment", {
 *   permissionSetArn: admin.permissionSetArn,
 *   principalType: "GROUP",
 *   principalId: engineers.groupId,
 *   targetId: prod.accountId,
 * });
 * ```
 *
 * @resource
 */
export declare const AccountAssignment: import("../../Resource.ts").ResourceClass<AccountAssignment>;
export declare const AccountAssignmentProvider: () => import("effect/Layer").Layer<Provider.Provider<AccountAssignment>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AccountAssignment.d.ts.map