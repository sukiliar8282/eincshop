import * as amplify from "@distilled.cloud/aws/amplify";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeAmplifyHttpBinding } from "./BindingHttp.js";
import { StopJob } from "./StopJob.js";
export const StopJobHttp = Layer.effect(StopJob, makeAmplifyHttpBinding({
    name: "StopJob",
    operation: amplify.stopJob,
    actions: ["amplify:StopJob"],
    resources: (app) => [Output.interpolate `${app.appArn}/branches/*/jobs/*`],
}));
//# sourceMappingURL=StopJobHttp.js.map