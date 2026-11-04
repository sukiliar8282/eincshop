/**
 * RESP2 + RESP3 codec. Commands are encoded as arrays of bulk strings.
 * Replies are parsed with a length-prefixed recursive reader so values
 * may contain CR/LF/`$`/`*` and may arrive split across TCP frames.
 *
 * Spec: https://github.com/redis/redis-specifications/blob/master/protocol/RESP2.md
 * Algorithm: the same as NodeRedis/node-redis-parser, reimplemented here
 * so alchemy does not take a Redis client dependency.
 */
import { ProtocolError, ReplyError } from "./Errors.ts";
export type Arg = string | number | Uint8Array;
/**
 * A decoded RESP value. Nested errors stay as {@link ReplyError} values
 * (arrays may contain them). Top-level errors fail the command.
 */
export type Reply = string | number | boolean | bigint | null | ReplyError | readonly Reply[] | {
    readonly [key: string]: Reply;
};
export type ParseResult = {
    readonly _tag: "Incomplete";
} | {
    readonly _tag: "Reply";
    readonly value: Reply;
} | {
    readonly _tag: "Error";
    readonly error: ReplyError;
} | {
    readonly _tag: "Push";
    readonly value: readonly Reply[];
} | {
    readonly _tag: "Protocol";
    readonly error: ProtocolError;
};
export declare const Incomplete: Extract<ParseResult, {
    _tag: "Incomplete";
}>;
export declare const encodeSimpleString: (value: string) => Uint8Array;
export declare const encodeError: (value: string) => Uint8Array;
export declare const encodeInteger: (value: number | bigint) => Uint8Array;
export declare const encodeBoolean: (value: boolean) => Uint8Array;
export declare const encodeDouble: (value: number) => Uint8Array;
export declare const encodeBigNumber: (value: bigint) => Uint8Array;
export declare const encodeNull: () => Uint8Array;
export declare const encodeNullArray: () => Uint8Array;
export declare const encodeBulk: (value: string | Uint8Array) => Uint8Array;
export declare const encodeArray: (items: readonly Uint8Array[]) => Uint8Array;
/** Encode a client command as a RESP array of bulk strings. */
export declare const encodeCommand: (command: string, args?: readonly Arg[]) => Uint8Array;
export declare const encodeReply: (value: Reply) => Uint8Array;
/**
 * Incremental RESP parser. Feed TCP chunks with {@link Parser.push} and
 * pull complete frames with {@link Parser.next}.
 */
export declare class Parser {
    #private;
    push(chunk: Uint8Array): void;
    /** Unparsed bytes still buffered. */
    get pending(): number;
    next(): ParseResult;
}
/** Parse one complete frame. Incomplete or leftover bytes are protocol errors. */
export declare const decode: (bytes: Uint8Array | string) => ParseResult;
/** Parse every complete frame in `bytes`. Trailing incomplete data errors. */
export declare const decodeAll: (bytes: Uint8Array | string) => ParseResult[];
//# sourceMappingURL=Resp.d.ts.map