import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessDataSourceHttpBinding } from "./BindingHttp.js";
import { ListDataSourceSyncJobs } from "./ListDataSourceSyncJobs.js";
export const ListDataSourceSyncJobsHttp = Layer.effect(ListDataSourceSyncJobs, makeQBusinessDataSourceHttpBinding({
    tag: "AWS.QBusiness.ListDataSourceSyncJobs",
    operation: qbusiness.listDataSourceSyncJobs,
    actions: ["qbusiness:ListDataSourceSyncJobs"],
}));
//# sourceMappingURL=ListDataSourceSyncJobsHttp.js.map