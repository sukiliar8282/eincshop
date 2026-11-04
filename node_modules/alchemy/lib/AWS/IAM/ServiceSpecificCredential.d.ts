import * as iam from "@distilled.cloud/aws/iam";
import type * as Duration from "effect/Duration";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ServiceSpecificCredentialProps {
    /**
     * User that owns the service-specific credential.
     */
    userName: string;
    /**
     * AWS service name that will consume the credential.
     */
    serviceName: string;
    /**
     * Optional credential validity duration, e.g. `"30 days"` or
     * `Duration.days(30)`. Sent to IAM as whole days (a bare number is
     * milliseconds). Changing it replaces the credential.
     */
    credentialAge?: Duration.Input;
    /**
     * Desired credential status.
     * @default "Active"
     */
    status?: iam.StatusType;
}
export interface ServiceSpecificCredential extends Resource<"AWS.IAM.ServiceSpecificCredential", ServiceSpecificCredentialProps, {
    /** The IAM user the credential belongs to. */
    userName: string;
    /** The AWS service the credential is scoped to (e.g. `codecommit.amazonaws.com`). */
    serviceName: string;
    /** The unique ID of the credential. */
    serviceSpecificCredentialId: string;
    /** Whether the credential is `Active` or `Inactive`. */
    status: iam.StatusType;
    /** When the credential was created. */
    createDate: Date | undefined;
    /** When the credential expires, if an age was configured. */
    expirationDate: Date | undefined;
    /** The generated service-specific user name. */
    serviceUserName: string | undefined;
    /** The generated credential alias, if the service issues one. */
    serviceCredentialAlias: string | undefined;
    /** The generated password. AWS only returns it at creation; later reads preserve the originally stored redacted value. */
    servicePassword: Redacted.Redacted<string> | undefined;
    /** The generated secret. AWS only returns it at creation; later reads preserve the originally stored redacted value. */
    serviceCredentialSecret: Redacted.Redacted<string> | undefined;
}, never, Providers> {
}
/**
 * A service-specific IAM credential.
 *
 * `ServiceSpecificCredential` creates service-bound credentials such as
 * CodeCommit HTTPS passwords for an IAM user. AWS only returns the secret
 * fields during creation, so subsequent reads preserve the originally stored
 * redacted values.
 * ### Managing Service Credentials
 * **Example:** Create a CodeCommit Credential
 * ```typescript
 * const user = yield* User("CodeCommitUser", {
 *   userName: "codecommit-user",
 * });
 *
 * const credential = yield* ServiceSpecificCredential("CodeCommitCredential", {
 *   userName: user.userName,
 *   serviceName: "codecommit.amazonaws.com",
 * });
 * ```
 *
 * @resource
 */
export declare const ServiceSpecificCredential: import("../../Resource.ts").ResourceClass<ServiceSpecificCredential>;
export declare const ServiceSpecificCredentialProvider: () => import("effect/Layer").Layer<Provider.Provider<ServiceSpecificCredential>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ServiceSpecificCredential.d.ts.map