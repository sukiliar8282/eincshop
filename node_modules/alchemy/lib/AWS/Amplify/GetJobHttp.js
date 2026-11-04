import * as amplify from "@distilled.cloud/aws/amplify";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeAmplifyHttpBinding } from "./BindingHttp.js";
import { GetJob } from "./GetJob.js";
export const GetJobHttp = Layer.effect(GetJob, makeAmplifyHttpBinding({
    name: "GetJob",
    operation: amplify.getJob,
    actions: ["amplify:GetJob"],
    resources: (app) => [Output.interpolate `${app.appArn}/branches/*/jobs/*`],
}));
//# sourceMappingURL=GetJobHttp.js.map