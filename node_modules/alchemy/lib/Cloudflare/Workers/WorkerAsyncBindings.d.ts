import * as Effect from "effect/Effect";
import type { InputProps } from "../../Input.ts";
import type { ResourceBinding } from "../../Resource.ts";
import type { Container } from "../Containers/Container.ts";
import { WorkflowResource } from "../Workflows/Workflow.ts";
import type { WorkerBindingProps } from "./Worker.ts";
import { type Worker, type WorkerObservability, type WorkerProps } from "./Worker.ts";
export declare const bindWorkerAsyncBindings: (resource: Worker, props: InputProps<WorkerProps<WorkerBindingProps, import("./Worker.ts").WorkerAssetsConfig | undefined>, never>) => Effect.Effect<undefined, never, import("../../Provider.ts").Provider<WorkflowResource> | import("../../Provider.ts").Provider<import("../../Random.ts").Random> | import("../Providers.ts").Providers>;
/**
 * Structural check for a `Cloudflare.Container` class declaration. Keyed on
 * the `~alchemy/Container/ClassName` marker (rather than importing from
 * `Containers/Container.ts`) to avoid a value-level import cycle through
 * `ContainerPlatform` → `Worker.ts` → this module.
 *
 * A Container declaration is Effect-shaped (yielding it resolves the
 * *started instance* tag, which only exists inside a Durable Object), so
 * every env-resolution site must check this before `Effect.isEffect`.
 */
export declare const isContainerDecl: (value: unknown) => value is Container.Decl.Any;
export declare const getCronBindings: (bindings: ReadonlyArray<ResourceBinding<Worker["Binding"]>>) => string[];
/**
 * Merge the Workers Cache settings contributed by `yield* Cloudflare.cache()`
 * bindings. Commutative: the cache is enabled (and cross-version) if any
 * contributor asked for it.
 */
export declare const getCacheBinding: (bindings: ReadonlyArray<ResourceBinding<Worker["Binding"]>>) => {
    enabled: boolean;
    crossVersionCache: true | undefined;
} | undefined;
/**
 * Resolve the observability metadata to upload. An explicit
 * `news.observability.traces` wins; otherwise the traces contributed by
 * `Cloudflare.Telemetry()` (a single binding row — rows are collapsed by
 * sid) fill in without clobbering the logs config. A cache-style `??` on
 * the whole object would drop the default `logs.invocationLogs`.
 */
export declare const resolveObservability: (news: Pick<WorkerProps, "observability">, bindings: ReadonlyArray<ResourceBinding<Worker["Binding"]>>) => WorkerObservability;
//# sourceMappingURL=WorkerAsyncBindings.d.ts.map