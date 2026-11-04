import * as Layer from "effect/Layer";
import { ListObjectsV2 } from "./ListObjectsV2.ts";
/**
 * HTTP implementation of {@link ListObjectsV2}. Calls distilled S3
 * `listObjectsV2` against the Tigris endpoint with the bucket's credentials.
 *
 * @layer
 * @provides Fly.ListObjectsV2
 */
export declare const ListObjectsV2Http: Layer.Layer<ListObjectsV2, never, never>;
//# sourceMappingURL=ListObjectsV2Http.d.ts.map