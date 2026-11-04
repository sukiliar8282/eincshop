import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessDataSourceHttpBinding } from "./BindingHttp.js";
import { StartDataSourceSyncJob } from "./StartDataSourceSyncJob.js";
export const StartDataSourceSyncJobHttp = Layer.effect(StartDataSourceSyncJob, makeQBusinessDataSourceHttpBinding({
    tag: "AWS.QBusiness.StartDataSourceSyncJob",
    operation: qbusiness.startDataSourceSyncJob,
    actions: ["qbusiness:StartDataSourceSyncJob"],
}));
//# sourceMappingURL=StartDataSourceSyncJobHttp.js.map