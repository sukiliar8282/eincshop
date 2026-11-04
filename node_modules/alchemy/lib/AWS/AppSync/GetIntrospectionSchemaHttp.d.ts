import * as Layer from "effect/Layer";
import { GetIntrospectionSchema } from "./GetIntrospectionSchema.ts";
/**
 * HTTP implementation of the {@link GetIntrospectionSchema} binding. Calls
 * `appsync:GetIntrospectionSchema` with the host Function's IAM role. The
 * action defines no IAM resource types, so the grant is necessarily
 * `Resource: "*"`; the runtime callable itself is fixed to the bound API's
 * `apiId`.
 */
export declare const GetIntrospectionSchemaHttp: Layer.Layer<GetIntrospectionSchema, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetIntrospectionSchemaHttp.d.ts.map