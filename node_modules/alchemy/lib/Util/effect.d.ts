import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
export type EffectClass<Shape, A, Err = never, Req = never> = Effect.Effect<A, Err, Req> & {
    new (_: never): Shape;
};
export declare const effectClass: {
    <A, Err = never, Req = never>(impl: Effect.Effect<A, Err, Req>): EffectClass<A, A, Err, Req>;
    <Shape>(): <A, Err = never, Req = never>(impl: Effect.Effect<A, Err, Req>) => EffectClass<Shape, A, Err, Req>;
};
export declare const taggedFunction: <Tag extends Context.ServiceClass<any, any, any>, Fn extends (...args: any[]) => any>(tag: Tag, fn: Fn) => Tag & Fn;
export declare const isYieldableEffect: (value: unknown) => value is Effect.Effect<unknown, unknown, unknown>;
export type YieldableEffectLike<A = unknown, E = unknown, R = unknown> = Effect.Effect<A, E, R> | {
    asEffect: () => Effect.Effect<A, E, R>;
    [Symbol.iterator]: () => Iterator<unknown>;
};
export declare const isEffectClassLike: (value: unknown) => value is YieldableEffectLike;
export declare const isYieldableEffectLike: (value: unknown) => value is YieldableEffectLike;
export type UnwrapEffect<T> = T extends Effect.Effect<infer A, any, any> ? A : T;
export type ToEffectInterface<T> = {
    raw: T;
} & {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? (...args: Parameters<T[K]>) => Effect.Effect<Awaited<ReturnType<T[K]>>> : T[K];
};
export declare const toEffectInterface: <T extends object>(raw: T) => ToEffectInterface<T>;
//# sourceMappingURL=effect.d.ts.map