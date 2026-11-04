/**
 * Buffers arbitrary text chunks and emits complete lines. Call `flush` when
 * the source closes to emit a trailing partial line.
 */
export declare const makeLineBuffer: (onLine: (line: string) => void) => {
    push(chunk: string): void;
    flush(): void;
};
//# sourceMappingURL=LineBuffer.d.ts.map