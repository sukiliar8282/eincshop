import * as Layer from "effect/Layer";
import { BatchGetImage } from "./BatchGetImage.ts";
/** HTTP implementation of {@link BatchGetImage} over the ECR API. */
export declare const BatchGetImageHttp: Layer.Layer<BatchGetImage, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=BatchGetImageHttp.d.ts.map