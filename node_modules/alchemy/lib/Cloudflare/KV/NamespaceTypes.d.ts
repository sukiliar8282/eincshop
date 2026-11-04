declare const NamespaceError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "NamespaceError";
} & Readonly<A>;
export declare class NamespaceError extends NamespaceError_base<{
    message: string;
    cause: Error;
}> {
}
export {};
//# sourceMappingURL=NamespaceTypes.d.ts.map