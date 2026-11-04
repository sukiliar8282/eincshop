import * as Layer from "effect/Layer";
import { HeadObject } from "./HeadObject.ts";
/**
 * HTTP implementation of {@link HeadObject}. Calls distilled S3
 * `headObject` against the Railway endpoint with the bucket's credentials.
 *
 * @layer
 * @provides Railway.HeadObject
 */
export declare const HeadObjectHttp: Layer.Layer<HeadObject, never, never>;
//# sourceMappingURL=HeadObjectHttp.d.ts.map