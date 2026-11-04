import * as iam from "@distilled.cloud/aws/iam";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AccessKeyProps {
    /**
     * User that owns the access key.
     */
    userName: string;
    /**
     * Desired access key status.
     * @default "Active"
     */
    status?: iam.StatusType;
}
export interface AccessKey extends Resource<"AWS.IAM.AccessKey", AccessKeyProps, {
    /** The IAM user the access key belongs to. */
    userName: string;
    /** The access key ID. */
    accessKeyId: string;
    /** Whether the key is `Active` or `Inactive`. */
    status: iam.StatusType;
    /** When the access key was created. */
    createDate: Date | undefined;
    /** The secret access key. AWS only returns it at creation; later reads preserve the originally stored redacted value. */
    secretAccessKey: Redacted.Redacted<string> | undefined;
    /** When the access key was last used, if ever. */
    lastUsedDate: Date | undefined;
    /** The AWS service the key last authenticated to. */
    lastUsedServiceName: string | undefined;
    /** The region of the key's last use. */
    lastUsedRegion: string | undefined;
}, never, Providers> {
}
/**
 * An IAM access key for a user.
 *
 * `AccessKey` manages long-lived programmatic credentials for an IAM user. The
 * secret access key is only returned during creation, so later reads preserve
 * the originally stored redacted value instead of pretending AWS can return it again.
 * ### Managing Programmatic Credentials
 * **Example:** Create an Access Key
 * ```typescript
 * const user = yield* User("DeployUser", {
 *   userName: "deploy-user",
 * });
 *
 * const key = yield* AccessKey("DeployUserKey", {
 *   userName: user.userName,
 *   status: "Active",
 * });
 * ```
 *
 * @resource
 */
export declare const AccessKey: import("../../Resource.ts").ResourceClass<AccessKey>;
export declare const AccessKeyProvider: () => import("effect/Layer").Layer<Provider.Provider<AccessKey>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AccessKey.d.ts.map