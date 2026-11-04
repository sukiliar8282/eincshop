import * as Effect from "effect/Effect";
import * as EngineDrift from "../../Drift.ts";
import type { Plan } from "../../Plan.ts";
import { type Session, type StackTarget } from "../Session.ts";
import * as Stack from "./stack.ts";
export interface DriftedResource {
    readonly fqn: string;
    readonly logicalId: string;
    readonly resourceType: string;
    readonly status: "in-sync" | "drifted" | "missing";
    readonly actual?: unknown;
}
export interface DriftSnapshot {
    readonly stack: {
        readonly name: string;
        readonly stage: string;
    };
    readonly resources: ReadonlyArray<DriftedResource>;
    readonly repairPlan: {
        readonly summary: Stack.PlanSummary;
        readonly native: Plan;
    };
    /** The session drift was inspected under; {@link repair} runs in it. */
    readonly session: Session;
}
/** Whether the drift check found anything worth repairing. */
export declare const hasDrift: (snapshot: DriftSnapshot) => boolean;
/** Compare deployed state against the real cloud and plan the repair. */
export declare const inspect: (target: StackTarget) => Effect.Effect<{
    stack: {
        name: string;
        stage: string;
    };
    resources: {
        fqn: string;
        logicalId: string;
        resourceType: string;
        status: "drifted" | "in-sync" | "missing";
        actual: any;
    }[];
    repairPlan: {
        summary: Stack.PlanSummary;
        native: Plan;
    };
    session: {
        stack: import("../../Stack.ts").CompiledStack<unknown, unknown>;
        context: import("effect/Context").Context<unknown>;
    };
}, any, import("../../AlchemyContext.ts").AlchemyContext | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("../../Auth/Credentials.ts").CredentialsStore | import("effect/Crypto").Crypto | import("effect/FileSystem").FileSystem | import("effect/unstable/http/HttpClient").HttpClient | import("../../Interaction.ts").Interaction | import("effect/Path").Path | import("../../Auth/Profile.ts").ProfileStore | import("effect/Scope").Scope>;
/**
 * Converge state back to the cloud's actual shape. Engine apply events are
 * reported through {@link Progress}.
 */
export declare const repair: (snapshot: DriftSnapshot) => Effect.Effect<EngineDrift.DriftResult, any, never>;
//# sourceMappingURL=drift.d.ts.map