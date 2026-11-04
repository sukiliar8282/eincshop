import * as Layer from "effect/Layer";
import { DeleteObject } from "./DeleteObject.ts";
/**
 * HTTP implementation of {@link DeleteObject}. Calls distilled S3
 * `deleteObject` against the Railway endpoint with the bucket's credentials.
 *
 * @layer
 * @provides Railway.DeleteObject
 */
export declare const DeleteObjectHttp: Layer.Layer<DeleteObject, never, never>;
//# sourceMappingURL=DeleteObjectHttp.d.ts.map