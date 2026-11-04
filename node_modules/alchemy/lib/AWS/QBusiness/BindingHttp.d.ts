import * as Effect from "effect/Effect";
import type { Application } from "./Application.ts";
import type { DataSource } from "./DataSource.ts";
import type { Index } from "./SearchIndex.ts";
import type { WebExperience } from "./WebExperience.ts";
/**
 * Shared scaffolding for AWS QBusiness HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the four
 * builders below. Everything except the operation and the IAM action list
 * is boilerplate: every Amazon Q Business operation is scoped to one
 * application (whose id is injected as `applicationId`), and the
 * index/data-source/web-experience operations additionally inject their
 * sub-resource ids and receive grants on the sub-resource ARN plus its
 * parents (Q Business authorizes most actions against both the application
 * and the sub-resource).
 */
/**
 * Build the impl Effect for an application-scoped Q Business operation
 * (chat, conversations, users, subscriptions, chat controls, policy): the
 * runtime callable injects the bound {@link Application}'s id as
 * `applicationId` and the deploy-time half grants `actions` on the
 * application ARN (plus any `subResources` suffix patterns, e.g.
 * `retriever/*` for `SearchRelevantContent`, which Q Business additionally
 * authorizes against the retriever it searches).
 */
export declare const makeQBusinessApplicationHttpBinding: <I extends {
    applicationId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.QBusiness.ChatSync`. */
    tag: string;
    /** The distilled operation; `applicationId` is injected from the application. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the application ARN. */
    actions: readonly string[];
    /**
     * Extra ARN suffix patterns (relative to the application ARN) the
     * actions are also granted on, e.g. `retriever/*`.
     */
    subResources?: readonly string[];
}) => Effect.Effect<(application: Application) => Effect.Effect<(request?: Omit<I, "applicationId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an index-scoped Q Business operation (document
 * batches, groups, document reads): the runtime callable injects the bound
 * {@link Index}'s `applicationId` + `indexId` and the deploy-time half
 * grants `actions` on the index ARN **and** its parent application ARN —
 * Q Business authorizes index actions against both.
 */
export declare const makeQBusinessIndexHttpBinding: <I extends {
    applicationId: string;
    indexId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.QBusiness.BatchPutDocument`. */
    tag: string;
    /**
     * The distilled operation; `applicationId` and `indexId` are injected
     * from the index.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the index ARN + its parent application ARN. */
    actions: readonly string[];
    /**
     * Extra ARN suffix patterns (relative to the index ARN) the actions are
     * also granted on, e.g. `data-source/*` for the principal-group
     * operations that also act on data-source-scoped groups.
     */
    subResources?: readonly string[];
}) => Effect.Effect<(index: Index) => Effect.Effect<(request?: Omit<I, "applicationId" | "indexId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a data-source-scoped Q Business operation (the
 * sync job start/stop/list trio): the runtime callable injects the bound
 * {@link DataSource}'s `applicationId` + `indexId` + `dataSourceId`; the
 * deploy-time half grants `actions` on the data source ARN **and** its
 * parent index + application ARNs.
 */
export declare const makeQBusinessDataSourceHttpBinding: <I extends {
    applicationId: string;
    indexId: string;
    dataSourceId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.QBusiness.StartDataSourceSyncJob`. */
    tag: string;
    /**
     * The distilled operation; `applicationId`, `indexId`, and
     * `dataSourceId` are injected from the data source.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /**
     * IAM actions granted on the data source ARN + its parent index and
     * application ARNs.
     */
    actions: readonly string[];
}) => Effect.Effect<(dataSource: DataSource) => Effect.Effect<(request?: Omit<I, "applicationId" | "dataSourceId" | "indexId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a web-experience-scoped Q Business operation
 * (anonymous URL minting): the runtime callable injects the bound
 * {@link WebExperience}'s `applicationId` + `webExperienceId`; the
 * deploy-time half grants `actions` on the web experience ARN **and** its
 * parent application ARN.
 */
export declare const makeQBusinessWebExperienceHttpBinding: <I extends {
    applicationId: string;
    webExperienceId: string;
}, A, E, R, Req = Omit<I, "applicationId" | "webExperienceId">>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.QBusiness.CreateAnonymousWebExperienceUrl`. */
    tag: string;
    /**
     * The distilled operation; `applicationId` and `webExperienceId` are
     * injected from the web experience.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /**
     * IAM actions granted on the web experience ARN + its parent application
     * ARN.
     */
    actions: readonly string[];
    /**
     * Map the public request shape to the wire request (defaults to
     * identity) — e.g. `CreateAnonymousWebExperienceUrl` converts a
     * `Duration.Input` into the wire `sessionDurationInMinutes`.
     */
    prepare?: (request: Req | undefined) => Omit<I, "applicationId" | "webExperienceId">;
}) => Effect.Effect<(webExperience: WebExperience) => Effect.Effect<(request?: Req | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map