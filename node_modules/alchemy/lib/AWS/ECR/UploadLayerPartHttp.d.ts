import * as Layer from "effect/Layer";
import { UploadLayerPart } from "./UploadLayerPart.ts";
/** HTTP implementation of {@link UploadLayerPart} over the ECR API. */
export declare const UploadLayerPartHttp: Layer.Layer<UploadLayerPart, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=UploadLayerPartHttp.d.ts.map