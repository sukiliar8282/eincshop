import * as Layer from "effect/Layer";
import { IdentityPoolAuth } from "./IdentityPoolAuth.ts";
/**
 * HTTP implementation of {@link IdentityPoolAuth}. The credentials-vending
 * flows are unauthenticated (Cognito does not evaluate IAM for them), so the
 * deploy-time half only records the binding — no policy statements are
 * attached.
 */
export declare const IdentityPoolAuthHttp: Layer.Layer<IdentityPoolAuth, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=IdentityPoolAuthHttp.d.ts.map