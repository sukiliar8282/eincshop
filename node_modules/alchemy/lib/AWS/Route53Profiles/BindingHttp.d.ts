import * as Effect from "effect/Effect";
import type { Profile } from "./Profile.ts";
/**
 * Shared scaffolding for Route 53 Profiles HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeProfilesHttpBinding({ … }))` over the builder
 * below. Everything except the operation, the IAM action list, and the grant
 * scope is boilerplate.
 */
/**
 * Build the impl Effect for a Route 53 Profiles operation scoped to a
 * {@link Profile}: the deploy-time half grants `actions`, and the runtime
 * half injects the profile's `ProfileId` into every request.
 *
 * The grant is on `*` — the Route 53 Profiles list actions follow the
 * common AWS List-action pattern of not supporting resource-level
 * permissions (a profile-ARN-scoped grant is rejected with AccessDenied).
 */
export declare const makeProfilesHttpBinding: <I extends {
    ProfileId?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Route53Profiles.ListProfileAssociations`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted by the binding. */
    actions: readonly string[];
}) => Effect.Effect<(profile: Profile) => Effect.Effect<(request?: Omit<I, "ProfileId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map