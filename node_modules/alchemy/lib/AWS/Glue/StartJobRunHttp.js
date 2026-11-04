import * as glue from "@distilled.cloud/aws/glue";
import * as Layer from "effect/Layer";
import { makeGlueJobHttpBinding } from "./BindingHttp.js";
import { StartJobRun } from "./StartJobRun.js";
export const StartJobRunHttp = Layer.effect(StartJobRun, makeGlueJobHttpBinding({
    tag: "AWS.Glue.StartJobRun",
    operation: glue.startJobRun,
    actions: ["glue:StartJobRun", "glue:GetJobRun"],
}));
//# sourceMappingURL=StartJobRunHttp.js.map