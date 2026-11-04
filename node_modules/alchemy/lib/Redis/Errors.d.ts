declare const UrlMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Redis.UrlMissing";
} & Readonly<A>;
/** No `REDIS_URL` in the Function/Service environment. */
export declare class UrlMissing extends UrlMissing_base<{
    name: string;
}> {
    get message(): string;
}
declare const CommandError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Redis.CommandError";
} & Readonly<A>;
/** A Redis command failed (RESP error, socket, or protocol). */
export declare class CommandError extends CommandError_base<{
    command: string;
    cause: unknown;
}> {
}
declare const ReplyError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Redis.ReplyError";
} & Readonly<A>;
/** Redis replied with a RESP error (`-ERR …`, `-WRONGTYPE …`). */
export declare class ReplyError extends ReplyError_base<{
    readonly code: string;
    readonly message: string;
}> {
}
declare const ProtocolError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Redis.ProtocolError";
} & Readonly<A>;
/** Bytes on the wire were not valid RESP. */
export declare class ProtocolError extends ProtocolError_base<{
    readonly message: string;
}> {
}
export {};
//# sourceMappingURL=Errors.d.ts.map