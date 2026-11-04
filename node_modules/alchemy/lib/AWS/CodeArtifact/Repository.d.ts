import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RepositoryProps {
    /**
     * Name of the domain that contains the repository. Pass a `Domain`'s
     * `domainName` attribute. Changing the domain replaces the repository.
     */
    domain: string;
    /**
     * AWS account ID that owns the domain, if it differs from the caller's
     * account (cross-account domains).
     */
    domainOwner?: string;
    /**
     * Name of the repository (2-100 chars). If omitted a deterministic physical
     * name is generated. Changing the name replaces the repository.
     */
    repositoryName?: string;
    /**
     * Human-readable description of the repository.
     */
    description?: string;
    /**
     * Names of other repositories in the same domain to configure as upstream
     * sources. Requests fall through to upstreams (and then any external
     * connection) on a cache miss.
     */
    upstreams?: string[];
    /**
     * A single external connection (e.g. `public:npmjs`, `public:pypi`,
     * `public:maven-central`) to a public package registry. AWS allows at most
     * one external connection per repository.
     */
    externalConnection?: string;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface Repository extends Resource<"AWS.CodeArtifact.Repository", RepositoryProps, {
    /** Physical name of the repository. */
    repositoryName: string;
    /** ARN of the repository. */
    repositoryArn: string;
    /** Name of the domain containing the repository. */
    domainName: string;
    /** AWS account ID that owns the containing domain. */
    domainOwner: string;
    /** AWS account that manages the repository resource. */
    administratorAccount: string;
}, never, Providers> {
}
/**
 * An AWS CodeArtifact repository — a package store inside a
 * {@link Domain}. Repositories host packages (npm, PyPI, Maven, NuGet, etc.)
 * and can chain to upstream repositories and a single external connection to a
 * public registry.
 *
 * ### Creating a Repository
 * **Example:** Basic Repository
 * ```typescript
 * const domain = yield* CodeArtifact.Domain("packages", {});
 * const repo = yield* CodeArtifact.Repository("npm-store", {
 *   domain: domain.domainName,
 * });
 * ```
 *
 * **Example:** Repository with an external connection to npmjs
 * ```typescript
 * const repo = yield* CodeArtifact.Repository("npm-store", {
 *   domain: domain.domainName,
 *   description: "Proxy of the public npm registry",
 *   externalConnection: "public:npmjs",
 * });
 * ```
 *
 * **Example:** Repository with an upstream
 * ```typescript
 * const shared = yield* CodeArtifact.Repository("shared", {
 *   domain: domain.domainName,
 * });
 * const app = yield* CodeArtifact.Repository("app", {
 *   domain: domain.domainName,
 *   upstreams: [shared.repositoryName],
 * });
 * ```
 *
 * @resource
 */
export declare const Repository: import("../../Resource.ts").ResourceClass<Repository>;
export declare const RepositoryProvider: () => import("effect/Layer").Layer<Provider.Provider<Repository>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Repository.d.ts.map