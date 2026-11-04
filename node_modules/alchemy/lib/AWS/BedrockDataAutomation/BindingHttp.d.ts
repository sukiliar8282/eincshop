import * as Effect from "effect/Effect";
import type { Blueprint } from "./Blueprint.ts";
import type { DataAutomationLibrary } from "./DataAutomationLibrary.ts";
import type { DataAutomationProject } from "./DataAutomationProject.ts";
/**
 * Shared scaffolding for Bedrock Data Automation HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two
 * builders below. Everything except the operation and the IAM action list is
 * boilerplate.
 */
/**
 * Build the impl Effect for a project-scoped runtime operation (the sync and
 * async invoke APIs). The runtime callable injects the bound
 * {@link DataAutomationProject}'s ARN + stage as `dataAutomationConfiguration`
 * and the deploy-time half grants `actions` on the project ARN plus the
 * account's data automation profiles in every region — cross-region
 * inference profiles (e.g. `us.data-automation-v1`) fan requests out to
 * sibling regions, so the profile grant cannot be scoped to one region.
 */
export declare const makeBdaProjectHttpBinding: <I extends {
    dataAutomationConfiguration?: {
        dataAutomationProjectArn: string;
        stage?: string;
    };
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.BedrockDataAutomation.InvokeDataAutomationAsync`. */
    tag: string;
    /** The distilled operation; `dataAutomationConfiguration` is injected from the project. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the project ARN + the account's profiles. */
    actions: readonly string[];
}) => Effect.Effect<(project: DataAutomationProject) => Effect.Effect<(request: Omit<I, "dataAutomationConfiguration">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a library-scoped runtime operation (entity reads
 * and ingestion-job APIs). The runtime callable injects the bound
 * {@link DataAutomationLibrary}'s ARN as `libraryArn` and the deploy-time
 * half grants `actions` on the library ARN.
 */
export declare const makeBdaLibraryHttpBinding: <I extends {
    libraryArn: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.BedrockDataAutomation.ListDataAutomationLibraryEntities`. */
    tag: string;
    /** The distilled operation; `libraryArn` is injected from the library. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the library ARN (+ `additionalResources`). */
    actions: readonly string[];
    /**
     * Extra resource ARNs the actions authorize against — the ingestion-job
     * APIs check `…:data-automation-library-ingestion-job/{id}` (minted at
     * runtime), not the library ARN.
     */
    additionalResources?: readonly string[];
}) => Effect.Effect<(library: DataAutomationLibrary) => Effect.Effect<(request: Omit<I, "libraryArn">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a blueprint-scoped runtime operation (blueprint
 * optimization). The runtime callable injects the bound {@link Blueprint}'s
 * ARN + stage as `blueprint` and the deploy-time half grants `actions` on the
 * blueprint ARN plus the account's data automation profiles in every region
 * (cross-region inference profiles fan out to sibling regions).
 */
export declare const makeBdaBlueprintOptimizationHttpBinding: <I extends {
    blueprint?: {
        blueprintArn: string;
        stage?: string;
    };
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.BedrockDataAutomation.InvokeBlueprintOptimizationAsync`. */
    tag: string;
    /** The distilled operation; `blueprint` is injected from the blueprint. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the blueprint ARN + the account's profiles. */
    actions: readonly string[];
}) => Effect.Effect<(blueprint: Blueprint) => Effect.Effect<(request: Omit<I, "blueprint">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a blueprint-scoped management operation (version
 * snapshots and stage copies). The runtime callable injects the bound
 * {@link Blueprint}'s ARN as `blueprintArn` and the deploy-time half grants
 * `actions` on the blueprint ARN.
 */
export declare const makeBdaBlueprintHttpBinding: <I extends {
    blueprintArn: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.BedrockDataAutomation.CreateBlueprintVersion`. */
    tag: string;
    /** The distilled operation; `blueprintArn` is injected from the blueprint. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the blueprint ARN. */
    actions: readonly string[];
}) => Effect.Effect<(blueprint: Blueprint) => Effect.Effect<(request: Omit<I, "blueprintArn">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level runtime operation (job status
 * polling). The deploy-time half grants `actions` on `*` — invocation ARNs
 * (`…:data-automation-invocation/{id}`) are minted at runtime and unknowable
 * at deploy time.
 */
export declare const makeBdaAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.BedrockDataAutomation.GetDataAutomationStatus`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map