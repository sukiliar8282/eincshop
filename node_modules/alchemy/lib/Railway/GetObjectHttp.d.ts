import * as Layer from "effect/Layer";
import { GetObject } from "./GetObject.ts";
/**
 * HTTP implementation of {@link GetObject}. Calls distilled S3
 * `getObject` against the Railway endpoint with the bucket's credentials.
 *
 * @layer
 * @provides Railway.GetObject
 */
export declare const GetObjectHttp: Layer.Layer<GetObject, never, never>;
//# sourceMappingURL=GetObjectHttp.d.ts.map