import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
type RpcEffectHandler<Args extends Array<any>, Success, Error> = (...args: Args) => Effect.Effect<Success, Error>;
type RpcWrappedEffectHandler<Args extends Array<any>, Success, Error> = (args: Args) => Promise<RpcSerializedExit<Success, Error>>;
type RpcStreamHandler<Args extends Array<any>, Success, Error> = (...args: Args) => Stream.Stream<Success, Error>;
type RpcWrappedStreamHandler<Args extends Array<any>, Success, Error> = (args: Args) => RpcSerializedStream<Success, Error>;
type RpcSerializedStream<Success, _Error> = ReadableStream<Success>;
type RpcSerializedExit<Success, Error> = {
    _tag: "Success";
    value: Success;
} | {
    _tag: "Failure";
    cause: Array<RpcSerializedCause<Error>>;
};
type RpcSerializedCause<Error> = {
    _tag: "Fail";
    error: Error;
} | {
    _tag: "Die";
    defect: unknown;
} | {
    _tag: "Interrupt";
    fiberId: number | undefined;
};
export type RpcWrapped<T> = T extends RpcEffectHandler<infer Args, infer Success, infer Error> ? RpcWrappedEffectHandler<Args, Success, Error> : T extends RpcStreamHandler<infer Args, infer Success, infer Error> ? RpcWrappedStreamHandler<Args, Success, Error> : T extends Record<string, any> ? {
    [K in keyof T]: RpcWrapped<T[K]>;
} : T;
export type RpcUnwrapped<T> = T extends RpcWrappedEffectHandler<infer Args, infer Success, infer Error> ? RpcEffectHandler<Args, Success, Error> : T extends RpcWrappedStreamHandler<infer Args, infer Success, infer Error> ? RpcStreamHandler<Args, Success, Error> : T extends Record<string, any> ? {
    [K in keyof T]: RpcUnwrapped<T[K]>;
} : T;
export declare const wrapRpcHandlers: <T extends Record<string, any>>(handlers: T, streamKeys?: Array<keyof T>) => RpcWrapped<T>;
export declare const unwrapRpcHandlers: <T extends Record<string, any>>(handlers: RpcWrapped<T>, streamKeys?: Array<keyof T>) => RpcUnwrapped<T>;
export {};
//# sourceMappingURL=RpcSerialization.d.ts.map