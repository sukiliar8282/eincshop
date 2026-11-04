import * as Layer from "effect/Layer";
import { DeleteObject } from "./DeleteObject.ts";
/**
 * HTTP implementation of {@link DeleteObject}. Calls distilled S3
 * `deleteObject` against the Tigris endpoint with the bucket's credentials.
 *
 * @layer
 * @provides Fly.DeleteObject
 */
export declare const DeleteObjectHttp: Layer.Layer<DeleteObject, never, never>;
//# sourceMappingURL=DeleteObjectHttp.d.ts.map