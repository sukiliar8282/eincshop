import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DomainProps {
    /**
     * Name of the domain (2-50 chars, lowercase letters, digits and hyphens).
     * If omitted a deterministic physical name is generated. Changing the name
     * replaces the domain.
     */
    domainName?: string;
    /**
     * ARN of a KMS key used to encrypt assets in the domain. Defaults to an
     * AWS-managed key. Immutable — changing it replaces the domain.
     */
    encryptionKey?: string;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface Domain extends Resource<"AWS.CodeArtifact.Domain", DomainProps, {
    /** Physical name of the domain. */
    domainName: string;
    /** ARN of the domain. */
    domainArn: string;
    /** AWS account ID that owns the domain. */
    owner: string;
    /** Domain status (`Active` or `Deleted`). */
    status: string;
    /** ARN of the KMS key used to encrypt assets in the domain. */
    encryptionKey: string;
    /** ARN of the S3 bucket backing the domain's asset storage. */
    s3BucketArn: string;
}, never, Providers> {
}
/**
 * An AWS CodeArtifact domain — the top-level container that groups a set of
 * package repositories and provides a single point for encryption, ownership
 * and cross-account access control.
 *
 * ### Creating a Domain
 * **Example:** Basic Domain
 * ```typescript
 * const domain = yield* CodeArtifact.Domain("packages", {});
 * ```
 *
 * **Example:** Domain with a customer-managed KMS key
 * ```typescript
 * const domain = yield* CodeArtifact.Domain("packages", {
 *   domainName: "my-org",
 *   encryptionKey: key.keyArn,
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * @resource
 */
export declare const Domain: import("../../Resource.ts").ResourceClass<Domain>;
export declare const DomainProvider: () => import("effect/Layer").Layer<Provider.Provider<Domain>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Domain.d.ts.map