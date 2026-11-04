/** Options accepted by a single {@link WriteQueueClient.send} call. */
export interface SendOptions {
    contentType?: "json" | "text";
}
/** A single message handed to {@link WriteQueueClient.sendBatch}. */
export interface SendMessage {
    body: unknown;
    contentType?: "json" | "text";
}
declare const SendError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SendError";
} & Readonly<A>;
export declare class SendError extends SendError_base<{
    message: string;
    cause?: unknown;
}> {
}
export {};
//# sourceMappingURL=QueueTypes.d.ts.map