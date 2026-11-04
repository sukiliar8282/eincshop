import * as Effect from "effect/Effect";
import type { Domain } from "./Domain.ts";
/**
 * Shared scaffolding for SimpleDB per-operation bindings.
 *
 * INTERNAL — deliberately not exported from the service `index.ts`.
 *
 * Every SimpleDB data-plane operation follows the same shape: it targets a
 * single {@link Domain}, requires the IAM action `sdb:{Operation}` on
 * `arn:aws:sdb:{region}:{account}:domain/{domainName}`, and (except for
 * `Select`) injects the domain's physical `DomainName` into the request.
 * `makeSimpleDbBinding` encodes that once so each `{Op}Http.ts` is a thin
 * call into it; `registerSimpleDbBinding` is the deploy-time IAM half on its
 * own for operations (like `Select`) that need a custom runtime client.
 */
/**
 * Deploy-time half of a SimpleDB binding: grants `sdb:{operation}` on the
 * domain's ARN to the host Function. No-op at runtime.
 */
export declare const registerSimpleDbBinding: (operation: string, domain: Domain) => Effect.Effect<void, never, never>;
/**
 * Builds the full binding implementation for a SimpleDB operation whose
 * request carries a `DomainName` member: registers the IAM grant and returns
 * a runtime client that closes over the domain's physical name and injects
 * it into every request.
 */
export declare const makeSimpleDbBinding: <Req extends {
    DomainName: string;
}, A, E, R>(options: {
    readonly operation: string;
    readonly method: Effect.Effect<(input: Req) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<(domain: Domain) => Effect.Effect<(request?: Omit<Req, "DomainName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=Binding.d.ts.map