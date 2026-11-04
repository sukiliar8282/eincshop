import type * as Stream from "effect/Stream";
export declare const getRawStream: (stream: Stream.Stream<any, any, any>) => ReadableStream | undefined;
export declare const streamHasRaw: (stream: Stream.Stream<any, any, any>) => stream is Stream.Stream<any, any, any> & {
    raw: ReadableStream;
};
//# sourceMappingURL=Stream.d.ts.map