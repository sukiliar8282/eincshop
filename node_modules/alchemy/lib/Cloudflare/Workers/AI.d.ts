import type * as Effect from "effect/Effect";
import type * as Layer from "effect/Layer";
import type { LanguageModel } from "effect/unstable/ai/LanguageModel";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import type { LanguageModelOptions } from "../AI/LanguageModel.ts";
import type { AIBinding } from "./AIBinding.ts";
import * as Binding from "./Binding.ts";
declare const TypeId: "Cloudflare.Workers.AI";
type TypeId = typeof TypeId;
declare const WorkersAIError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "WorkersAIError";
} & Readonly<A>;
/**
 * Error raised by Workers AI runtime operations (`ai.run`, `ai.models`, …).
 */
export declare class WorkersAIError extends WorkersAIError_base<{
    /**
     * Human-readable runtime error message.
     */
    message: string;
    /**
     * Original error thrown by the Cloudflare runtime binding.
     */
    cause: unknown;
}> {
}
/**
 * The native Cloudflare Workers AI binding — run inference on Workers AI
 * models directly from a Worker, with no AI Gateway (or any other cloud
 * resource) required. This is the plain `{ type: "ai" }` Worker binding: the
 * runtime value is the same `env.AI` handle you would declare in
 * `wrangler.json`.
 *
 * `AI` is a single value that is at once the `Binding.Service` tag, the
 * callable that produces an {@link AIBinding}, and the type. Declare it on a
 * Worker's `env` (it flows through `InferEnv` → the runtime `Ai` handle) or
 * `yield*` it inside an Effect-native Worker to attach the binding and obtain
 * the {@link AIClient}.
 *
 * Use `Cloudflare.AI.Gateway` + `QueryGateway` instead when you want requests
 * routed through an AI Gateway (caching, rate limiting, logs); use `AI` when
 * you just want to call Workers AI models.
 *
 *
 * ### Effect-style Worker (recommended)
 * **Example:** Run a Workers AI model
 * ```typescript
 * Cloudflare.Worker("AiWorker", { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const ai = yield* Cloudflare.Workers.AI();
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const result = yield* ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
 *           prompt: "What is the origin of the phrase Hello, World?",
 *         }).pipe(Effect.orDie);
 *         return yield* HttpServerResponse.json(result);
 *       }),
 *     };
 *   }).pipe(Effect.provide(Cloudflare.Workers.AIBinding)),
 * );
 * ```
 *
 * ### Effect AI LanguageModel
 * **Example:** `ai.model(...)` -> Effect AI `LanguageModel`
 * `model(options)` produces a `Layer<LanguageModel, never, RuntimeContext>`
 * that translates `LanguageModel.generateText` / `streamText` calls
 * (including tool calls) into `ai.run(...)` against the bound Workers AI
 * model — the same adapter AI Gateway's `QueryGateway` uses, minus the
 * gateway routing.
 * ```typescript
 * const ai = yield* Cloudflare.Workers.AI();
 *
 * const languageModel = ai.model({
 *   model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
 *   parameters: { temperature: 0.7, maxTokens: 1024 },
 * });
 *
 * const response = yield* LanguageModel.generateText({ prompt }).pipe(
 *   Effect.provide(languageModel),
 * );
 * ```
 *
 * ### Binding to an Async Worker
 * **Example:** Example
 * ```typescript
 * export const Worker = Cloudflare.Worker("Worker", {
 *   main: "./src/worker.ts",
 *   env: { AI: Cloudflare.Workers.AI() },
 * });
 *
 * export type WorkerEnv = Cloudflare.InferEnv<typeof Worker>;
 * //   { AI: Ai }
 * ```
 *
 * @see https://developers.cloudflare.com/workers-ai/
 *
 * @binding
 * @product Workers AI
 * @category AI
 */
export interface AI extends Binding.Service<AI, TypeId, AIClient> {
    /**
     * @param name Binding name (logical id) — the `env` key it resolves to.
     * @default "AI"
     */
    (name?: string): AIBinding;
}
export declare const AI: AI;
export declare const isAI: (value: unknown) => value is AIBinding;
/**
 * Effect-native client for a Cloudflare Workers AI binding. Wraps the runtime
 * `Ai` handle so each operation returns an Effect tagged with
 * {@link WorkersAIError}, and provides a `model(options)` factory that
 * produces an `effect/unstable/ai` `LanguageModel` `Layer`.
 */
export interface AIClient {
    /**
     * Effect resolving to the raw Workers AI runtime binding.
     */
    raw: Effect.Effect<Ai, never, RuntimeContext>;
    /**
     * Run inference on a Workers AI model. Typed by the model catalog from
     * `@cloudflare/workers-types` — pass `options` (e.g. `returnRawResponse`,
     * `gateway`) through to the runtime binding.
     */
    run<Name extends keyof AiModels>(model: Name, inputs: AiModels[Name]["inputs"], options?: AiOptions): Effect.Effect<AiModels[Name]["postProcessedOutputs"], WorkersAIError, RuntimeContext>;
    /**
     * List Workers AI models from the catalog, optionally filtered.
     */
    models(params?: AiModelsSearchParams): Effect.Effect<AiModelsSearchObject[], WorkersAIError, RuntimeContext>;
    /**
     * Provide an `effect/unstable/ai` `LanguageModel` layer backed by this
     * binding and the given Workers AI model.
     */
    model(options: Omit<LanguageModelOptions, "client">): Layer.Layer<LanguageModel, never, RuntimeContext>;
}
export {};
//# sourceMappingURL=AI.d.ts.map