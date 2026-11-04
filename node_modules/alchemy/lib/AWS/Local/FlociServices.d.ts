/** @effect-diagnostics anyUnknownInErrorContext:off */
import type { FlociError } from "@alchemy.run/floci";
import * as Layer from "effect/Layer";
import type { Platform } from "../../Platform.ts";
import type { ResourceClassLike, ResourceLike } from "../../Resource.ts";
/**
 * Fixed dummy account used for every floci-emulated resource. Attributes
 * computed from it (ARNs, queue URLs) double as proof that no real AWS
 * account was involved.
 */
export declare const FLOCI_ACCOUNT_ID = "000000000000";
/** Region every floci-emulated resource lives in. */
export declare const FLOCI_REGION = "us-east-1";
/**
 * The floci-scoped override context for local-mode AWS providers, as a
 * **module-memoized layer reference** (see the note on
 * [Local/ProviderLayer.ts](../../Local/ProviderLayer.ts)): every
 * {@link flociDual} registration shares this one reference, so the stack
 * build's MemoMap constructs it — and runs `ensureFloci()` — exactly once
 * per stack build, and only when a local-mode provider is actually demanded.
 */
export declare const flociServices: () => Layer.Layer<any, FlociError, never>;
/**
 * Registers an AWS resource provider with both a **live** and a **local**
 * (floci-emulated) implementation via `ProviderLayer.dual`. The local
 * variant is the SAME live provider code with every lifecycle method
 * endpoint-wrapped to the floci emulator ({@link flociServices}), so
 * `alchemy dev` routes the resource to the emulator while `alchemy deploy`
 * (and `Alchemy.remote()` in dev) keeps hitting the real cloud.
 *
 * @example
 * ```ts
 * // in Providers.ts, replacing `S3.BucketProvider(),`:
 * flociDual(S3.Bucket, () => S3.BucketProvider()),
 * ```
 */
export declare const flociDual: <R extends ResourceLike, L extends Layer.Layer<any, any, any>>(cls: ResourceClassLike<R> | Platform<R, any, any, any, any> | {
    Type: R["Type"];
}, live: () => L) => Layer.Layer<any, any, any>;
//# sourceMappingURL=FlociServices.d.ts.map