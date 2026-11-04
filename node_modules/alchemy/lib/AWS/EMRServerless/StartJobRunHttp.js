import * as emr from "@distilled.cloud/aws/emr-serverless";
import * as Layer from "effect/Layer";
import { makeEmrServerlessHttpBinding } from "./BindingHttp.js";
import { StartJobRun } from "./StartJobRun.js";
export const StartJobRunHttp = Layer.effect(StartJobRun, makeEmrServerlessHttpBinding({
    tag: "AWS.EMRServerless.StartJobRun",
    operation: emr.startJobRun,
    actions: ["emr-serverless:StartJobRun"],
    passRole: true,
}));
//# sourceMappingURL=StartJobRunHttp.js.map