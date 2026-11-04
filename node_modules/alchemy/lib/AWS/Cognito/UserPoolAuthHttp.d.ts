import * as Layer from "effect/Layer";
import { UserPoolAuth } from "./UserPoolAuth.ts";
/**
 * HTTP implementation of {@link UserPoolAuth}. The token-based auth-flow
 * operations are unauthenticated (Cognito does not evaluate IAM for them),
 * so the deploy-time half only records the binding — no policy statements
 * are attached.
 */
export declare const UserPoolAuthHttp: Layer.Layer<UserPoolAuth, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=UserPoolAuthHttp.d.ts.map