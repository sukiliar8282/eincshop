import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { PolicyDocument } from "./Policy.ts";
export interface UserProps {
    /**
     * User name. If omitted, a deterministic name is generated.
     */
    userName?: string;
    /**
     * Optional IAM path prefix.
     * @default "/"
     */
    path?: string;
    /**
     * Optional permissions boundary policy ARN.
     */
    permissionsBoundary?: string;
    /**
     * Managed policy ARNs attached to the user.
     */
    managedPolicyArns?: string[];
    /**
     * Inline policies embedded in the user.
     */
    inlinePolicies?: Record<string, PolicyDocument>;
    /**
     * User-defined tags to apply to the user.
     */
    tags?: Record<string, string>;
}
export interface User extends Resource<"AWS.IAM.User", UserProps, {
    /** The ARN of the user. */
    userArn: string;
    /** The name of the user. */
    userName: string;
    /** The stable unique ID of the user. */
    userId: string | undefined;
    /** The IAM path of the user. */
    path: string | undefined;
    /** The managed policy ARN used as the permissions boundary, if any. */
    permissionsBoundary: string | undefined;
    /** Managed policy ARNs attached to the user. */
    managedPolicyArns: string[];
    /** Inline policies embedded in the user, keyed by policy name. */
    inlinePolicies: Record<string, PolicyDocument>;
    /** The tags applied to the user. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An IAM user with optional inline policies, managed policies, and tags.
 *
 * `User` manages a long-lived IAM identity together with its attached managed
 * policies, inline policies, permissions boundary, and tags.
 * ### Creating IAM Users
 * **Example:** User with Managed Policies
 * ```typescript
 * const user = yield* User("AppUser", {
 *   userName: "app-user",
 *   managedPolicyArns: [
 *     "arn:aws:iam::aws:policy/ReadOnlyAccess",
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const User: import("../../Resource.ts").ResourceClass<User>;
export declare const UserProvider: () => import("effect/Layer").Layer<Provider.Provider<User>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=User.d.ts.map