import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
declare const InstanceId_base: Context.ServiceClass<InstanceId, "instance-id", string>;
/** A 16-byte (128-bit) random hex-encoded string representing an physical instance of a logical resource */
export declare class InstanceId extends InstanceId_base {
}
/**
 * @returns Hex-encoded instance ID (16 random bytes)
 */
export declare const generateInstanceId: () => Effect.Effect<string, never, never>;
export {};
//# sourceMappingURL=InstanceId.d.ts.map