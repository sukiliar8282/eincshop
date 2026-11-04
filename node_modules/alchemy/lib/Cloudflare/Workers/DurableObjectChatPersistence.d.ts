import * as Layer from "effect/Layer";
import { BackingPersistence } from "effect/unstable/persistence/Persistence";
import { DurableObjectState } from "./DurableObjectState.ts";
/**
 * A `BackingPersistence` layer (Effect AI persistence module) backed
 * by the surrounding Durable Object's `state.storage`. Drop-in storage
 * for `Persistence.layerResultPersisted({ storeId })` so chat history,
 * cached AI responses, or any other persisted state lives in the DO
 * SQLite store with `${storeId}:` key namespacing.
 *
 * Multiple `storeId`s can coexist within a single Durable Object —
 * keys are namespaced with a `${storeId}:` prefix so they don't
 * collide.
 *
 * :::caution
 * TTL is currently ignored; Durable Object storage has no native TTL.
 * If you need expiry, layer a TTL-aware backing store on top, or run
 * a periodic `clear`.
 * :::
 *
 *
 * ### Wiring it into a chat-backing DO
 * **Example:** Persisted chat history per DO instance
 * `Persistence.layerResultPersisted({ storeId })` is the seam Effect
 * AI exposes for cached/replayable AI calls. Layer
 * `DurableObjectChatPersistence` underneath and every entry is stored
 * in the DO's `state.storage` under the `alchemy.chat:` prefix.
 * ```typescript
 * import * as Cloudflare from "alchemy/Cloudflare";
 * import * as Effect from "effect/Effect";
 * import * as Layer from "effect/Layer";
 * import { Chat, LanguageModel } from "effect/unstable/ai";
 * import { Persistence } from "effect/unstable/persistence";
 *
 * export default class ChatBackend extends Cloudflare.DurableObject<ChatBackend>()(
 *   "ChatBackend",
 *   Effect.gen(function* () {
 *     return Effect.gen(function* () {
 *       const persistence = yield* Persistence.layerResultPersisted({
 *         storeId: "alchemy.chat",
 *       }).pipe(Layer.provide(Cloudflare.AI.DurableObjectChatPersistence));
 *
 *       return {
 *         send: (threadId: string, prompt: string) =>
 *           LanguageModel.generateText({ prompt }).pipe(Effect.provide(persistence)),
 *       };
 *     });
 *   }),
 * ) {}
 * ```
 *
 * ### Multiple stores in the same DO
 * **Example:** Separate `storeId`s coexist
 * Different `storeId`s namespace their keys with `${storeId}:`, so
 * one DO can keep, say, chat history *and* an audit log in separate
 * stores without colliding.
 * ```typescript
 * const aiPersistence = yield* Persistence.layerResultPersisted({
 *   storeId: "alchemy.chat",
 * }).pipe(Layer.provide(Cloudflare.AI.DurableObjectChatPersistence));
 *
 * const auditPersistence = yield* Persistence.layerResultPersisted({
 *   storeId: "alchemy.audit",
 * }).pipe(Layer.provide(Cloudflare.AI.DurableObjectChatPersistence));
 * ```
 *
 * @binding
 * @product Workers
 * @category Workers & Compute
 */
export declare const DurableObjectChatPersistence: Layer.Layer<BackingPersistence, never, DurableObjectState>;
//# sourceMappingURL=DurableObjectChatPersistence.d.ts.map