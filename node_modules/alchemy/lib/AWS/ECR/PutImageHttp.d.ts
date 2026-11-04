import * as Layer from "effect/Layer";
import { PutImage } from "./PutImage.ts";
/** HTTP implementation of {@link PutImage} over the ECR API. */
export declare const PutImageHttp: Layer.Layer<PutImage, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=PutImageHttp.d.ts.map