import * as amplify from "@distilled.cloud/aws/amplify";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeAmplifyHttpBinding } from "./BindingHttp.js";
import { StartJob } from "./StartJob.js";
export const StartJobHttp = Layer.effect(StartJob, makeAmplifyHttpBinding({
    name: "StartJob",
    operation: amplify.startJob,
    actions: ["amplify:StartJob"],
    resources: (app) => [Output.interpolate `${app.appArn}/branches/*/jobs/*`],
}));
//# sourceMappingURL=StartJobHttp.js.map