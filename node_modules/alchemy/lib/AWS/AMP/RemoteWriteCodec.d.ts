/**
 * Pure encoding helpers for the Prometheus remote-write wire format.
 *
 * Remote-write bodies are a `prometheus.WriteRequest` protobuf message,
 * snappy-compressed (raw block format). Both encodings are small and fully
 * specified, so they are hand-rolled here rather than pulling in protobuf +
 * snappy dependencies:
 *
 * ```proto
 * message WriteRequest { repeated TimeSeries timeseries = 1; }
 * message TimeSeries   { repeated Label labels = 1; repeated Sample samples = 2; }
 * message Label        { string name = 1; string value = 2; }
 * message Sample       { double value = 1; int64 timestamp = 2; }
 * ```
 *
 * The snappy encoder emits literal-only blocks (no back-references), which is
 * valid snappy — decoders don't require compressed output. Remote-write
 * payloads are small enough that the size cost is irrelevant.
 *
 * NOT exported from `index.ts` — internal to the RemoteWrite binding.
 */
/** One sample of a series being remote-written; timestamp in epoch millis. */
export interface EncodableSample {
    value: number;
    timestamp: number;
}
/** One fully-resolved time series: sorted-ready labels plus samples. */
export interface EncodableSeries {
    /** Complete label set INCLUDING `__name__`. */
    labels: Record<string, string>;
    samples: EncodableSample[];
}
/** Encode a `prometheus.WriteRequest` protobuf message. */
export declare const encodeWriteRequest: (timeseries: readonly EncodableSeries[]) => Uint8Array;
/**
 * Snappy-compress `input` using the raw block format with literal-only
 * elements: `varint(len(input))` followed by literal chunks of at most 64 KiB
 * each. Valid snappy per the format spec (compression is optional).
 */
export declare const snappyCompress: (input: Uint8Array) => Uint8Array;
//# sourceMappingURL=RemoteWriteCodec.d.ts.map