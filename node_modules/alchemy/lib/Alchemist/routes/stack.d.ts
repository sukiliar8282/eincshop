import * as Effect from "effect/Effect";
import * as Plan from "../../Plan.ts";
import type { PlannedAction, PlannedResource } from "../../Report.ts";
import { type Session, type StackTarget } from "../Session.ts";
export type { StackTarget } from "../Session.ts";
export interface PlanInput {
    readonly target: StackTarget;
    readonly operation: "deploy" | "destroy";
    readonly force?: boolean;
    readonly adopt?: boolean;
    readonly updateStateStore?: boolean;
    /** Run local (emulated) providers instead of the real cloud. */
    readonly dev?: boolean;
}
/** Infer the deployed stack output from an `alchemy.run.ts` module type. */
export type StackModuleOutput<Module> = Module extends {
    readonly default: infer Definition;
} ? Definition extends Effect.Effect<any, any, any> ? Effect.Success<Definition> extends {
    readonly output: infer Output;
} ? Output : unknown : unknown : unknown;
export interface PlanSummary {
    readonly create: number;
    readonly update: number;
    readonly adopted: number;
    readonly replace: number;
    readonly delete: number;
    readonly orphaned: number;
    readonly noop: number;
}
export interface PlanSnapshot<Output = unknown> {
    readonly stack: {
        readonly name: string;
        readonly stage: string;
    };
    readonly summary: PlanSummary;
    /**
     * Serializable resource rows (including orphan deletions) with their
     * bindings and provider modes — what a remote renderer shows without
     * holding {@link PlanSnapshot.native}.
     */
    readonly resources: ReadonlyArray<PlannedResource>;
    /** Serializable stack-action rows. */
    readonly actions: ReadonlyArray<PlannedAction>;
    /** The engine plan, as consumed by in-process renderers and {@link apply}. */
    readonly native: Plan.Plan<Output>;
    readonly createdAt: Date;
    /** The session this plan was computed under; {@link apply} runs in it. */
    readonly session: Session;
}
/** Whether a plan proposes any cloud mutations (i.e. approval-worthy work). */
export declare const hasChanges: (summary: PlanSummary) => boolean;
export declare const summarize: (plan: Plan.Plan) => PlanSummary;
/**
 * Import the stack, resolve its services, and compute a deploy or destroy
 * plan. Planning phases are reported through {@link Progress}; the returned
 * snapshot is what {@link apply} executes.
 */
export declare const plan: <Module = unknown>(input: PlanInput) => Effect.Effect<{
    resources: ReadonlyArray<PlannedResource>;
    actions: ReadonlyArray<PlannedAction>;
    stack: {
        name: string;
        stage: string;
    };
    summary: PlanSummary;
    native: Plan.Plan<StackModuleOutput<Module>>;
    createdAt: Date;
    session: {
        stack: import("../../Stack.ts").CompiledStack<unknown, unknown>;
        context: import("effect/Context").Context<unknown>;
    };
}, unknown, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
/**
 * Apply a computed plan. Engine apply events are reported through
 * {@link Progress} as `ApplyEvent`.
 */
export declare const apply: <Output>(snapshot: PlanSnapshot<Output>) => Effect.Effect<import("../../Input.ts").Input.Resolve<Output>, import("../../Auth/AuthProvider.ts").AuthError | import("effect/Config").ConfigError | import("../../Auth/Demand.ts").CredentialsRequired | import("../../Apply.ts").DestroyError | import("../../Output.ts").InvalidReferenceError | import("../../Output.ts").MissingSourceError | import("../../Auth/AuthProvider.ts").NeedsReauth | import("effect/PlatformError").PlatformError | import("../../State/State.ts").StateStoreError, never>;
//# sourceMappingURL=stack.d.ts.map