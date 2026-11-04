import * as Layer from "effect/Layer";
import { GetObject } from "./GetObject.ts";
/**
 * HTTP implementation of {@link GetObject}. Calls distilled S3
 * `getObject` against the Tigris endpoint with the bucket's credentials.
 *
 * @layer
 * @provides Fly.GetObject
 */
export declare const GetObjectHttp: Layer.Layer<GetObject, never, never>;
//# sourceMappingURL=GetObjectHttp.d.ts.map