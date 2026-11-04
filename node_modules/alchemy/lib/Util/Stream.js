export const getRawStream = (stream) => streamHasRaw(stream) ? stream.raw : undefined;
export const streamHasRaw = (stream) => "raw" in stream && stream.raw != null;
//# sourceMappingURL=Stream.js.map