import type { Config } from "effect/Config";
import type { Effect } from "effect/Effect";
import type * as S from "effect/Schema";
import type { Primitive } from ".//Util/data.ts";
import type { Output } from "./Output.ts";
export type Function = (...args: any[]) => any;
export type Constructor = new (...args: any[]) => any;
type PolicyLike = {
    kind: "alchemy/Policy";
};
export type Input<T> = T | Output<T> | Config<T> | Effect<T, any, any> | (T extends S.Schema<any> ? never : Output<T, any> | (T extends Primitive ? never : T extends any[] ? number extends T["length"] ? Input<T[number]>[] : Inputs<T> : T extends object ? {
    [K in keyof T]: Input<T[K]>;
} : never));
export type InputProps<T extends Record<string, any>, Static extends keyof T = never> = {
    [K in keyof T]: K extends Static ? T[K] : Input<T[K]>;
};
/**
 * Distributes {@link Input} over each member of a (possibly union) Props
 * type. A resource whose Props form a discriminated union (e.g. Access
 * IdentityProvider's `type` ↔ `config` pairing) must keep the correlation
 * between the discriminant and its payload — a non-distributive mapped
 * type over the union collapses `keyof` to the common keys and severs
 * that link, silently accepting a `config` from the wrong variant.
 */
export type PropsInput<P> = P extends object ? {
    [K in keyof P]: Input<P[K]>;
} : P extends undefined ? {} : never;
export declare namespace Input {
    type Resolve<T> = T extends {
        Type: string;
        Attributes: infer Attributes;
    } ? {
        [K in keyof Attributes]: Resolve<Attributes[K]>;
    } : T extends Output<infer U> ? U : T extends Primitive | Constructor | Function | S.Schema<any> | PolicyLike ? T : T extends any[] ? ResolveArray<T> : T extends Record<string, any> ? {
        [k in keyof T]: Input.Resolve<T[k]>;
    } : never;
    type ResolveArray<T extends any[]> = number extends T["length"] ? Resolve<T[number]>[] : ResolveTuple<T>;
    type ResolveTuple<T extends any[], Accum extends any[] = []> = T extends [infer H, ...infer Tail] ? ResolveTuple<Tail, [...Accum, Input.Resolve<H>]> : Accum;
    type ResolveProps<Props extends Record<string, any>> = {
        [k in keyof Props]: Input.Resolve<Props[k]>;
    };
    type ResolveOpaque<T> = true extends IsOut<T> ? ResolveOut<T> : Resolve<T>;
    type IsOut<T> = T extends Output<infer _U> ? true : never;
    type ResolveOut<T> = T extends Output<infer U> ? U : never;
}
export type Inputs<T extends any[], Out extends any[] = []> = T extends [
    infer H,
    ...infer T
] ? Inputs<T, [...Out, Input<H>]> : Out;
export {};
//# sourceMappingURL=Input.d.ts.map