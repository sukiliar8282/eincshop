import * as amplify from "@distilled.cloud/aws/amplify";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeAmplifyHttpBinding } from "./BindingHttp.js";
import { ListJobs } from "./ListJobs.js";
export const ListJobsHttp = Layer.effect(ListJobs, makeAmplifyHttpBinding({
    name: "ListJobs",
    operation: amplify.listJobs,
    actions: ["amplify:ListJobs"],
    resources: (app) => [Output.interpolate `${app.appArn}/branches/*/jobs/*`],
}));
//# sourceMappingURL=ListJobsHttp.js.map