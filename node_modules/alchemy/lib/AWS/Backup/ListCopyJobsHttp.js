import * as backup from "@distilled.cloud/aws/backup";
import * as Layer from "effect/Layer";
import { makeBackupAccountHttpBinding } from "./BindingHttp.js";
import { ListCopyJobs } from "./ListCopyJobs.js";
export const ListCopyJobsHttp = Layer.effect(ListCopyJobs, makeBackupAccountHttpBinding({
    tag: "AWS.Backup.ListCopyJobs",
    operation: backup.listCopyJobs,
    actions: ["backup:ListCopyJobs"],
}));
//# sourceMappingURL=ListCopyJobsHttp.js.map