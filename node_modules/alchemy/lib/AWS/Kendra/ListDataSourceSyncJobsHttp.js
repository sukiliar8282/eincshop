import * as kendra from "@distilled.cloud/aws/kendra";
import * as Layer from "effect/Layer";
import { makeKendraDataSourceHttpBinding } from "./BindingHttp.js";
import { ListDataSourceSyncJobs } from "./ListDataSourceSyncJobs.js";
export const ListDataSourceSyncJobsHttp = Layer.effect(ListDataSourceSyncJobs, makeKendraDataSourceHttpBinding({
    tag: "AWS.Kendra.ListDataSourceSyncJobs",
    operation: kendra.listDataSourceSyncJobs,
    actions: ["kendra:ListDataSourceSyncJobs"],
}));
//# sourceMappingURL=ListDataSourceSyncJobsHttp.js.map