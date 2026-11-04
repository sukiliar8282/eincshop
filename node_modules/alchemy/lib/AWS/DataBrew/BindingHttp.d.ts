import * as Effect from "effect/Effect";
import type { Job } from "./Job.ts";
import type { Project } from "./Project.ts";
import type { Recipe } from "./Recipe.ts";
/**
 * Shared scaffolding for AWS Glue DataBrew HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Every DataBrew data-plane operation addresses its resource by a
 * `Name` path parameter and authorizes against that resource's ARN, so each
 * builder injects the bound resource's name and grants `actions` on its ARN;
 * everything except the operation and the IAM action is boilerplate.
 */
/**
 * Build the impl Effect for a job-anchored operation: the runtime callable
 * injects the bound {@link Job}'s name as `Name` and the deploy-time half
 * grants `actions` on the job ARN.
 */
export declare const makeDataBrewJobHttpBinding: <I extends {
    Name?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DataBrew.StartJobRun`. */
    tag: string;
    /** The distilled operation; `Name` is injected from the job. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the job ARN. */
    actions: readonly string[];
}) => Effect.Effect<<J extends Job>(job: J) => Effect.Effect<(request?: Omit<I, "Name"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a project-anchored operation: the runtime
 * callable injects the bound {@link Project}'s name as `Name` and the
 * deploy-time half grants `actions` on the project ARN.
 */
export declare const makeDataBrewProjectHttpBinding: <I extends {
    Name?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DataBrew.StartProjectSession`. */
    tag: string;
    /** The distilled operation; `Name` is injected from the project. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the project ARN. */
    actions: readonly string[];
}) => Effect.Effect<<P extends Project>(project: P) => Effect.Effect<(request?: Omit<I, "Name"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a recipe-anchored operation: the runtime
 * callable injects the bound {@link Recipe}'s name as `Name` and the
 * deploy-time half grants `actions` on the recipe ARN.
 */
export declare const makeDataBrewRecipeHttpBinding: <I extends {
    Name?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DataBrew.PublishRecipe`. */
    tag: string;
    /** The distilled operation; `Name` is injected from the recipe. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the recipe ARN. */
    actions: readonly string[];
}) => Effect.Effect<<Rec extends Recipe>(recipe: Rec) => Effect.Effect<(request?: Omit<I, "Name"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map