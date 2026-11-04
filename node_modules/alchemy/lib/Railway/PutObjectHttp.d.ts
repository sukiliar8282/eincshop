import * as Layer from "effect/Layer";
import { PutObject } from "./PutObject.ts";
/**
 * HTTP implementation of {@link PutObject}. Calls distilled S3
 * `putObject` against the Railway endpoint with the bucket's credentials.
 *
 * @layer
 * @provides Railway.PutObject
 */
export declare const PutObjectHttp: Layer.Layer<PutObject, never, never>;
//# sourceMappingURL=PutObjectHttp.d.ts.map