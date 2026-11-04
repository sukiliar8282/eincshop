import * as Layer from "effect/Layer";
import { CreateDeployment } from "./CreateDeployment.ts";
/**
 * Bespoke (multi-statement IAM): besides `codedeploy:CreateDeployment` on
 * the group, creating a deployment reads the deployment configuration and
 * the application revision on the caller's behalf, so the grant also covers
 * `GetDeploymentConfig` on the account's configs and
 * `GetApplicationRevision`/`RegisterApplicationRevision` on the group's
 * application.
 */
export declare const CreateDeploymentHttp: Layer.Layer<CreateDeployment, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=CreateDeploymentHttp.d.ts.map