import * as backup from "@distilled.cloud/aws/backup";
import * as Layer from "effect/Layer";
import { makeBackupAccountHttpBinding } from "./BindingHttp.js";
import { ListRecoveryPointsByResource } from "./ListRecoveryPointsByResource.js";
export const ListRecoveryPointsByResourceHttp = Layer.effect(ListRecoveryPointsByResource, makeBackupAccountHttpBinding({
    tag: "AWS.Backup.ListRecoveryPointsByResource",
    operation: backup.listRecoveryPointsByResource,
    actions: ["backup:ListRecoveryPointsByResource"],
}));
//# sourceMappingURL=ListRecoveryPointsByResourceHttp.js.map