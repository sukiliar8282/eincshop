import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface InstanceProfileProps {
    /**
     * Name of the instance profile. If omitted, a deterministic name is generated.
     */
    instanceProfileName?: string;
    /**
     * Optional IAM path prefix.
     * @default "/"
     */
    path?: string;
    /**
     * Optional role attached to the instance profile.
     */
    roleName?: Input<string>;
    /**
     * User-defined tags to apply to the instance profile.
     */
    tags?: Record<string, string>;
}
export interface InstanceProfile extends Resource<"AWS.IAM.InstanceProfile", InstanceProfileProps, {
    /** The ARN of the instance profile. */
    instanceProfileArn: string;
    /** The name of the instance profile. */
    instanceProfileName: string;
    /** The stable unique ID of the instance profile. */
    instanceProfileId: string | undefined;
    /** The IAM path of the instance profile. */
    path: string | undefined;
    /** The role attached to the instance profile, if any. */
    roleName: string | undefined;
    /** The tags applied to the instance profile. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An IAM instance profile that can present a role to EC2 instances.
 *
 * `InstanceProfile` bridges IAM roles into EC2 so compute instances can assume
 * the attached role through the instance metadata service.
 * ### Attaching Roles to EC2
 * **Example:** Create an Instance Profile
 * ```typescript
 * const role = yield* Role("InstanceRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "ec2.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 * });
 *
 * const profile = yield* InstanceProfile("WebProfile", {
 *   roleName: role.roleName,
 * });
 * ```
 *
 * @resource
 */
export declare const InstanceProfile: import("../../Resource.ts").ResourceClass<InstanceProfile>;
export declare const InstanceProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<InstanceProfile>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=InstanceProfile.d.ts.map