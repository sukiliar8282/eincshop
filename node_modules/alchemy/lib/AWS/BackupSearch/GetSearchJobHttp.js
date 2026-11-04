import * as backupsearch from "@distilled.cloud/aws/backupsearch";
import * as Layer from "effect/Layer";
import { makeSearchJobScopedHttpBinding } from "./BindingHttp.js";
import { GetSearchJob } from "./GetSearchJob.js";
export const GetSearchJobHttp = Layer.effect(GetSearchJob, makeSearchJobScopedHttpBinding({
    tag: "AWS.BackupSearch.GetSearchJob",
    operation: backupsearch.getSearchJob,
    actions: ["backup-search:GetSearchJob"],
}));
//# sourceMappingURL=GetSearchJobHttp.js.map