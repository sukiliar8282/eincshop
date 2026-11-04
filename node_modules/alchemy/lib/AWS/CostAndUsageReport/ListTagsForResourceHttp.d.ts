import * as Layer from "effect/Layer";
import { ListTagsForResource } from "./ListTagsForResource.ts";
/**
 * HTTP implementation of {@link ListTagsForResource}: grants
 * `cur:ListTagsForResource` on the bound report definition's ARN and calls
 * the us-east-1 CUR endpoint with the function's IAM credentials, injecting
 * the report's name as the `ReportName`.
 */
export declare const ListTagsForResourceHttp: Layer.Layer<ListTagsForResource, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListTagsForResourceHttp.d.ts.map