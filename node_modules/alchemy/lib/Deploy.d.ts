import type { ConfigError } from "effect/Config";
import * as Effect from "effect/Effect";
import type * as Scope from "effect/Scope";
import { AlchemyContext } from "./AlchemyContext.ts";
import * as Apply from "./Apply.ts";
import type { Input } from "./Input.ts";
import { type CompiledStack, type StackEffect } from "./Stack.ts";
import { Stage } from "./Stage.ts";
export declare const deploy: <A>({ stack, stage, dev, scope, force, }: {
    stack: StackEffect<CompiledStack<A>, ConfigError, Stage | AlchemyContext>;
    stage: string;
    dev?: boolean;
    /** See {@link evalStack} — when set, scoped resources outlive `deploy`. */
    scope?: Scope.Scope;
    force?: boolean;
}) => Effect.Effect<Input.Resolve<A>, import("./Auth/AuthProvider.ts").AuthError | ConfigError | import("./Auth/Demand.ts").CredentialsRequired | Apply.DestroyError | import("./Output.ts").InvalidReferenceError | import("./Output.ts").MissingSourceError | import("./Auth/AuthProvider.ts").NeedsReauth | import("effect/PlatformError").PlatformError | import("./State/State.ts").StateStoreError, AlchemyContext | import("./Artifacts.ts").ArtifactStore | import("effect/FileSystem").FileSystem | import("./Interaction.ts").Interaction | import("effect/Path").Path | import("./State/State.ts").State>;
//# sourceMappingURL=Deploy.d.ts.map