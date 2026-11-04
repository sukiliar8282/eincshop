import * as Layer from "effect/Layer";
import { CreateWorkspaceServiceAccountToken } from "./CreateWorkspaceServiceAccountToken.ts";
/**
 * Bespoke (not scaffold-built): the runtime request carries a
 * `timeToLive: Duration.Input` that is converted to the wire's
 * `secondsToLive` via the central Duration util.
 */
export declare const CreateWorkspaceServiceAccountTokenHttp: Layer.Layer<CreateWorkspaceServiceAccountToken, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=CreateWorkspaceServiceAccountTokenHttp.d.ts.map