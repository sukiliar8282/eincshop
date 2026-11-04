import * as Effect from "effect/Effect";
import type { SigningProfile } from "./SigningProfile.ts";
/**
 * Build the impl Effect for an operation whose input carries a `profileName`
 * field: the runtime callable injects the bound {@link SigningProfile}'s name
 * and the deploy-time half grants `actions` on the profile ARN (and its
 * version-qualified pattern).
 */
export declare const makeSignerProfileHttpBinding: <I extends {
    profileName?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Signer.StartSigningJob`. */
    tag: string;
    /** The distilled operation; `profileName` is injected from the profile. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the profile ARN + version pattern. */
    actions: readonly string[];
}) => Effect.Effect<(profile: SigningProfile) => Effect.Effect<(request: Omit<I, "profileName">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level Signer operation (signing jobs
 * are addressed by runtime-chosen job ids; platforms are AWS-managed read-only
 * catalog entries): the binding takes no resource argument and the deploy-time
 * half grants `actions` on `Resource: ["*"]`.
 */
export declare const makeSignerHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Signer.DescribeSigningJob`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /**
     * IAM actions granted on `Resource: ["*"]` (the target jobs/platforms are
     * chosen per request at runtime and unknowable at deploy time).
     */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map