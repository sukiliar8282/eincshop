import type { Input } from "../Input.ts";
import { type Output } from "../Output.ts";
import type { IsAny } from "./types.ts";
export declare const isUnknown: <V>(value: V) => value is Output<Input.Resolve<V>>;
export type IsUnknown<T> = unknown extends T ? IsAny<T> extends true ? false : true : false;
export type UnknownKeys<T> = {
    [K in keyof T]: IsUnknown<T[K]> extends true ? K : never;
}[keyof T];
export type ExcludeUnknown<T> = IsUnknown<T> extends true ? never : T;
//# sourceMappingURL=unknown.d.ts.map