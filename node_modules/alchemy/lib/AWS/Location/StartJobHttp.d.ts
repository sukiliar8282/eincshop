import * as Layer from "effect/Layer";
import { StartJob } from "./StartJob.ts";
/**
 * Bespoke (not via `BindingHttp.ts`): StartJob is the one Location binding
 * that injects an identifier from a *foreign* resource (the IAM execution
 * role) and needs a second `iam:PassRole` grant alongside the `geo:` action.
 */
export declare const StartJobHttp: Layer.Layer<StartJob, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=StartJobHttp.d.ts.map