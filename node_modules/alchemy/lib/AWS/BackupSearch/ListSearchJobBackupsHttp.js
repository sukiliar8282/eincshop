import * as backupsearch from "@distilled.cloud/aws/backupsearch";
import * as Layer from "effect/Layer";
import { makeSearchJobScopedHttpBinding } from "./BindingHttp.js";
import { ListSearchJobBackups } from "./ListSearchJobBackups.js";
export const ListSearchJobBackupsHttp = Layer.effect(ListSearchJobBackups, makeSearchJobScopedHttpBinding({
    tag: "AWS.BackupSearch.ListSearchJobBackups",
    operation: backupsearch.listSearchJobBackups,
    actions: ["backup-search:ListSearchJobBackups"],
}));
//# sourceMappingURL=ListSearchJobBackupsHttp.js.map