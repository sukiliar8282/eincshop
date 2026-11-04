import * as backup from "@distilled.cloud/aws/backup";
import * as Layer from "effect/Layer";
import { makeBackupVaultHttpBinding } from "./BindingHttp.js";
import { ListRecoveryPointsByBackupVault } from "./ListRecoveryPointsByBackupVault.js";
export const ListRecoveryPointsByBackupVaultHttp = Layer.effect(ListRecoveryPointsByBackupVault, makeBackupVaultHttpBinding({
    tag: "AWS.Backup.ListRecoveryPointsByBackupVault",
    operation: backup.listRecoveryPointsByBackupVault,
    actions: ["backup:ListRecoveryPointsByBackupVault"],
}));
//# sourceMappingURL=ListRecoveryPointsByBackupVaultHttp.js.map