import * as Effect from "effect/Effect";
import type { Repository } from "./Repository.ts";
/**
 * Shared scaffolding for the ECR HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeEcrRepositoryHttpBinding({ … }))`. Everything
 * except the operation and the IAM action list is boilerplate: per the ECR
 * service authorization reference every repository-scoped action authorizes
 * against the repository ARN, and the runtime callable injects the bound
 * {@link Repository}'s `repositoryName` into every request.
 */
/** The repository-scoping fields every repository-scoped ECR operation takes. */
export interface RepositoryScopedRequest {
    registryId?: string;
    repositoryName: string;
}
/**
 * Build the impl Effect for a repository-scoped ECR operation. The
 * deploy-time half grants `iamActions` on the bound repository's ARN; the
 * runtime callable injects the repository's `repositoryName` into every
 * request (the registry defaults to the caller's own account).
 *
 * Registry-level operations (`ecr:GetAuthorizationToken`, which authorizes
 * only on `Resource: ["*"]`) stay bespoke in their own `{Op}Http.ts`.
 */
export declare const makeEcrRepositoryHttpBinding: <I extends RepositoryScopedRequest, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"DescribeImages"`.
     */
    capability: string;
    /** The distilled operation implementing the capability. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the bound repository's ARN. */
    iamActions: readonly string[];
}) => Effect.Effect<(repository: Repository) => Effect.Effect<(request?: Omit<I, keyof RepositoryScopedRequest> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map