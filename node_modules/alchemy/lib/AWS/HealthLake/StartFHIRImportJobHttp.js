import * as healthlake from "@distilled.cloud/aws/healthlake";
import * as Layer from "effect/Layer";
import { makeHealthLakeStartJobHttpBinding } from "./BindingHttp.js";
import { StartFHIRImportJob } from "./StartFHIRImportJob.js";
export const StartFHIRImportJobHttp = Layer.effect(StartFHIRImportJob, makeHealthLakeStartJobHttpBinding({
    tag: "AWS.HealthLake.StartFHIRImportJob",
    operation: healthlake.startFHIRImportJob,
    actions: ["healthlake:StartFHIRImportJob"],
}));
//# sourceMappingURL=StartFHIRImportJobHttp.js.map