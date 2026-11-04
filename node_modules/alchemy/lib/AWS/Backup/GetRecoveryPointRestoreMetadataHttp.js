import * as backup from "@distilled.cloud/aws/backup";
import * as Layer from "effect/Layer";
import { makeBackupVaultHttpBinding } from "./BindingHttp.js";
import { GetRecoveryPointRestoreMetadata } from "./GetRecoveryPointRestoreMetadata.js";
export const GetRecoveryPointRestoreMetadataHttp = Layer.effect(GetRecoveryPointRestoreMetadata, makeBackupVaultHttpBinding({
    tag: "AWS.Backup.GetRecoveryPointRestoreMetadata",
    operation: backup.getRecoveryPointRestoreMetadata,
    actions: ["backup:GetRecoveryPointRestoreMetadata"],
    // Recovery-point actions authorize on the recovery point ARN (the
    // underlying resource's snapshot ARN), not the vault ARN.
    wildcardIam: true,
}));
//# sourceMappingURL=GetRecoveryPointRestoreMetadataHttp.js.map