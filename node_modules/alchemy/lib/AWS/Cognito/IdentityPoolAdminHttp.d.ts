import * as Layer from "effect/Layer";
import { IdentityPoolAdmin } from "./IdentityPoolAdmin.ts";
/**
 * HTTP implementation of {@link IdentityPoolAdmin}: grants the
 * `cognito-identity:*` identity-management actions on the bound pool's ARN
 * and calls the Cognito Identity HTTP API with the function's IAM
 * credentials.
 */
export declare const IdentityPoolAdminHttp: Layer.Layer<IdentityPoolAdmin, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=IdentityPoolAdminHttp.d.ts.map