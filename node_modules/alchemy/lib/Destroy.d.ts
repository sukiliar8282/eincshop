import type { ConfigError } from "effect/Config";
import { Effect } from "effect";
import type * as Scope from "effect/Scope";
import type { AlchemyContext } from "./AlchemyContext.ts";
import * as Apply from "./Apply.ts";
import type { CompiledStack, StackEffect } from "./Stack.ts";
import type { Stage } from "./Stage.ts";
export declare const destroy: ({ stack, stage, dev, scope, }: {
    stack: StackEffect<CompiledStack, ConfigError, Stage | AlchemyContext>;
    stage: string;
    dev?: boolean;
    /** See {@link evalStack} — when set, scoped resources outlive `destroy`. */
    scope?: Scope.Scope;
}) => Effect.Effect<undefined, import("./Auth/AuthProvider.ts").AuthError | ConfigError | import("./Auth/Demand.ts").CredentialsRequired | Apply.DestroyError | import("./Output.ts").InvalidReferenceError | import("./Output.ts").MissingSourceError | import("./Auth/AuthProvider.ts").NeedsReauth | import("effect/PlatformError").PlatformError | import("./State/State.ts").StateStoreError, AlchemyContext | import("./Artifacts.ts").ArtifactStore | import("effect/FileSystem").FileSystem | import("./Interaction.ts").Interaction | import("effect/Path").Path | import("./State/State.ts").State>;
//# sourceMappingURL=Destroy.d.ts.map