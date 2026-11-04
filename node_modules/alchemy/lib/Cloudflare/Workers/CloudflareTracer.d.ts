import * as Layer from "effect/Layer";
/**
 * Per-event Tracer Layer. Cloudflare owns sampling and export; scalar
 * attributes are forwarded; events, links, and non-scalars stay
 * Effect-local. Completion is recorded as `effect.exit`. Effect trace/span
 * IDs are independent of Cloudflare's opaque IDs.
 */
export declare const layer: Layer.Layer<never>;
//# sourceMappingURL=CloudflareTracer.d.ts.map