import * as Effect from "effect/Effect";
import type { ReplacedResourceState, ResourceState } from "../../State/ResourceState.ts";
import { DurableObject } from "../Workers/DurableObject.ts";
declare const Store_base: Effect.Effect<DurableObject<Store>, never, import("../index.ts").Worker> & (new (_: never) => {
    /**
     * (Root DO only) List every stack name ever registered.
     */
    listStacks: () => Effect.Effect<string[], never, import("../../RuntimeContext.ts").RuntimeContext>;
    /**
     * (Root DO only) Register a stack name. Idempotent — safe to
     * call on every `set` to the corresponding stack DO.
     */
    registerStack: ({ stack }: {
        stack: string;
    }) => Effect.Effect<void, never, import("../../RuntimeContext.ts").RuntimeContext>;
    /**
     * (Root DO only) Remove a stack name from the global index.
     */
    unregisterStack: ({ stack }: {
        stack: string;
    }) => Effect.Effect<boolean, never, import("../../RuntimeContext.ts").RuntimeContext>;
    /** (Stack DO only) List stages with at least one resource. */
    listStages: () => Effect.Effect<string[], never, import("../../RuntimeContext.ts").RuntimeContext>;
    /** (Stack DO only) List every resource FQN in a stage. */
    listResources: ({ stage }: {
        stage: string;
    }) => Effect.Effect<string[], never, import("../../RuntimeContext.ts").RuntimeContext>;
    /**
     * (Stack DO only) Get a resource by (stage, fqn). Returns
     * null if missing.
     */
    get: ({ stage, fqn }: {
        stage: string;
        fqn: string;
    }) => Effect.Effect<ResourceState | undefined, never, import("../../RuntimeContext.ts").RuntimeContext>;
    /**
     * (Stack DO only) Persist a resource. Returns the stored
     * value unchanged.
     */
    set: ({ stage, fqn, value, }: {
        stage: string;
        fqn: string;
        value: ResourceState;
    }) => Effect.Effect<ResourceState, never, import("../../RuntimeContext.ts").RuntimeContext>;
    /**
     * (Stack DO only) Delete a resource. Idempotent.
     *
     * Exposed as `remove` (not `delete`) because Cloudflare's
     * Durable Object RPC stub reserves `delete` and refuses to
     * proxy the call, surfacing as "RPC receiver does not
     * implement the method 'delete'".
     */
    remove: ({ stage, fqn }: {
        stage: string;
        fqn: string;
    }) => Effect.Effect<boolean, never, import("../../RuntimeContext.ts").RuntimeContext>;
    /**
     * (Stack DO only) Delete every resource in this stack, or every
     * resource in a single stage when specified.
     */
    deleteStack: ({ stage }?: {
        stage?: string;
    }) => Effect.Effect<void, never, import("../../RuntimeContext.ts").RuntimeContext>;
    /**
     * (Stack DO only) Read the persisted stack output for `stage`.
     * Returns `undefined` when the stage has not been deployed.
     */
    getOutput: ({ stage }: {
        stage: string;
    }) => Effect.Effect<ResourceState | undefined, never, import("../../RuntimeContext.ts").RuntimeContext>;
    /**
     * (Stack DO only) Persist the resolved stack output for
     * `stage`. Returns the stored value unchanged.
     */
    setOutput: ({ stage, value }: {
        stage: string;
        value: any;
    }) => Effect.Effect<any, never, import("../../RuntimeContext.ts").RuntimeContext>;
    /**
     * (Stack DO only) Return every resource in a stage whose
     * `status === "replaced"`. Each entry is decrypted so the
     * `status` field can be inspected.
     */
    getReplacedResources: ({ stage }: {
        stage: string;
    }) => Effect.Effect<ReplacedResourceState[], never, import("../../RuntimeContext.ts").RuntimeContext>;
});
export default class Store extends Store_base {
    /**
     * Well-known DO name whose sole job is to track the set of stacks
     * that have ever had resources written. `listStacks` queries it;
     * every `set` asks it to register the stack (idempotent).
     */
    static readonly ROOT_DO_NAME: "__root__";
}
export {};
//# sourceMappingURL=Store.d.ts.map