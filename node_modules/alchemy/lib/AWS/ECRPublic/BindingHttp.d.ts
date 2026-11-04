import * as Effect from "effect/Effect";
import { Region } from "../Region.ts";
import type { PublicRepository } from "./Repository.ts";
/** Pin a distilled `ecr-public` effect to the service's home region. */
export declare const pinEcrPublic: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, Exclude<R, Region>>;
/**
 * Build the impl Effect for an operation scoped to one
 * {@link PublicRepository}. The runtime callable injects the bound
 * repository's name as the request's `repositoryName`; the deploy-time half
 * grants `iamActions` on the repository's ARN.
 */
export declare const makePublicRepositoryHttpBinding: <I extends {
    repositoryName: string;
}, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"DescribeImages"`.
     */
    capability: string;
    /** IAM actions granted on the repository ARN. */
    iamActions: readonly string[];
    /** The distilled operation; `repositoryName` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<(repository: PublicRepository) => Effect.Effect<(request?: Omit<I, "repositoryName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, Exclude<R, Region>>;
/**
 * Build the impl Effect for a registry-level ECR Public operation
 * (`GetAuthorizationToken`, `DescribeRegistries`, `GetRegistryCatalogData` —
 * none of which are repository-scoped, so the grant is on
 * `Resource: ["*"]`).
 */
export declare const makePublicRegistryHttpBinding: <I extends object, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"GetAuthorizationToken"`.
     */
    capability: string;
    /** IAM actions granted on `Resource: ["*"]`. */
    iamActions: readonly string[];
    /** The distilled operation implementing the capability. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, Exclude<R, Region>>;
//# sourceMappingURL=BindingHttp.d.ts.map