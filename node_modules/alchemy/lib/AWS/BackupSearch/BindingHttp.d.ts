import * as Effect from "effect/Effect";
import type { SearchJob } from "./SearchJob.ts";
/**
 * Shared scaffolding for BackupSearch HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeSearchJobScopedHttpBinding({ … }))` over the
 * builder below. Everything except the operation and the IAM action list is
 * boilerplate.
 *
 * BackupSearch IAM actions live under the `backup-search:` service prefix.
 */
/**
 * Build the impl Effect for a search-job-scoped operation: the runtime
 * callable injects the bound {@link SearchJob}'s identifier as
 * `SearchJobIdentifier` and the deploy-time half grants `actions` on the
 * search job ARN.
 */
export declare const makeSearchJobScopedHttpBinding: <I extends {
    SearchJobIdentifier: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.BackupSearch.ListSearchJobResults`. */
    tag: string;
    /** The distilled operation; `SearchJobIdentifier` is injected from the resource. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the search job ARN. */
    actions: readonly string[];
}) => Effect.Effect<(searchJob: SearchJob) => Effect.Effect<(request?: Omit<I, "SearchJobIdentifier"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map