import * as backupsearch from "@distilled.cloud/aws/backupsearch";
import * as Layer from "effect/Layer";
import { makeSearchJobScopedHttpBinding } from "./BindingHttp.js";
import { ListSearchJobResults } from "./ListSearchJobResults.js";
export const ListSearchJobResultsHttp = Layer.effect(ListSearchJobResults, makeSearchJobScopedHttpBinding({
    tag: "AWS.BackupSearch.ListSearchJobResults",
    operation: backupsearch.listSearchJobResults,
    actions: ["backup-search:ListSearchJobResults"],
}));
//# sourceMappingURL=ListSearchJobResultsHttp.js.map