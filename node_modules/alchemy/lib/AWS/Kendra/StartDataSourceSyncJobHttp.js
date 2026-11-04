import * as kendra from "@distilled.cloud/aws/kendra";
import * as Layer from "effect/Layer";
import { makeKendraDataSourceHttpBinding } from "./BindingHttp.js";
import { StartDataSourceSyncJob } from "./StartDataSourceSyncJob.js";
export const StartDataSourceSyncJobHttp = Layer.effect(StartDataSourceSyncJob, makeKendraDataSourceHttpBinding({
    tag: "AWS.Kendra.StartDataSourceSyncJob",
    operation: kendra.startDataSourceSyncJob,
    actions: ["kendra:StartDataSourceSyncJob"],
}));
//# sourceMappingURL=StartDataSourceSyncJobHttp.js.map