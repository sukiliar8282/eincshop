import * as kendra from "@distilled.cloud/aws/kendra";
import * as Layer from "effect/Layer";
import { makeKendraDataSourceHttpBinding } from "./BindingHttp.js";
import { StopDataSourceSyncJob } from "./StopDataSourceSyncJob.js";
export const StopDataSourceSyncJobHttp = Layer.effect(StopDataSourceSyncJob, makeKendraDataSourceHttpBinding({
    tag: "AWS.Kendra.StopDataSourceSyncJob",
    operation: kendra.stopDataSourceSyncJob,
    actions: ["kendra:StopDataSourceSyncJob"],
}));
//# sourceMappingURL=StopDataSourceSyncJobHttp.js.map