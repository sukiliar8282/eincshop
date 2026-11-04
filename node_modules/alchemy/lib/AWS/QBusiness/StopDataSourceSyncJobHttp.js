import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessDataSourceHttpBinding } from "./BindingHttp.js";
import { StopDataSourceSyncJob } from "./StopDataSourceSyncJob.js";
export const StopDataSourceSyncJobHttp = Layer.effect(StopDataSourceSyncJob, makeQBusinessDataSourceHttpBinding({
    tag: "AWS.QBusiness.StopDataSourceSyncJob",
    operation: qbusiness.stopDataSourceSyncJob,
    actions: ["qbusiness:StopDataSourceSyncJob"],
}));
//# sourceMappingURL=StopDataSourceSyncJobHttp.js.map