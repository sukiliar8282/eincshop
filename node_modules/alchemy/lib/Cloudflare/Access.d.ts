import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
declare const AccessError_base: Schema.Class<AccessError, Schema.TaggedStruct<"AccessError", {
    readonly message: Schema.String;
    readonly cause: Schema.optional<Schema.Defect>;
}>, import("effect/Cause").YieldableError>;
export declare class AccessError extends AccessError_base {
}
declare const Access_base: Context.ServiceClass<Access, "alchemy/Cloudflare/Access", {
    readonly getAccessHeaders: (domain: string) => Effect.Effect<Record<string, string>, AccessError>;
}>;
export declare class Access extends Access_base {
}
export declare const AccessLive: Layer.Layer<Access, never, ChildProcessSpawner.ChildProcessSpawner>;
export {};
//# sourceMappingURL=Access.d.ts.map