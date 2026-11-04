import { UserFacingError } from "../UserFacingError.ts";
/** A non-fatal note attached to a successful result. */
export interface Diagnostic {
    readonly severity: "debug" | "info" | "warning" | "error";
    readonly code: string;
    readonly message: string;
}
declare const AlchemistInvalidInput_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AlchemistInvalidInput";
} & Readonly<A>;
/** The caller sent something the route cannot act on. */
export declare class AlchemistInvalidInput extends AlchemistInvalidInput_base<{
    readonly message: string;
    readonly field?: string;
}> {
    readonly [UserFacingError] = true;
}
declare const AlchemistNotFound_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AlchemistNotFound";
} & Readonly<A>;
/** A named entity (profile, provider) does not resolve. */
export declare class AlchemistNotFound extends AlchemistNotFound_base<{
    readonly kind: string;
    readonly id: string;
}> {
    readonly [UserFacingError] = true;
    /** Human-readable line derived from the missing entity's kind and id. */
    get message(): string;
}
export {};
//# sourceMappingURL=Errors.d.ts.map