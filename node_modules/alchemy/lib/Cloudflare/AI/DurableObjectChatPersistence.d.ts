import * as Layer from "effect/Layer";
import * as Chat from "effect/unstable/ai/Chat";
import { BackingPersistence } from "effect/unstable/persistence/Persistence";
import { DurableObjectState } from "../Workers/DurableObjectState.ts";
export declare const DurableObjectChatPersistence: Layer.Layer<BackingPersistence, never, DurableObjectState>;
export declare const layerChatDurableObject: Layer.Layer<Chat.Persistence, never, DurableObjectState>;
//# sourceMappingURL=DurableObjectChatPersistence.d.ts.map