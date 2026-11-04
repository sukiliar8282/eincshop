import * as backup from "@distilled.cloud/aws/backup";
import * as Layer from "effect/Layer";
import { makeBackupAccountHttpBinding } from "./BindingHttp.js";
import { PutRestoreValidationResult } from "./PutRestoreValidationResult.js";
export const PutRestoreValidationResultHttp = Layer.effect(PutRestoreValidationResult, makeBackupAccountHttpBinding({
    tag: "AWS.Backup.PutRestoreValidationResult",
    operation: backup.putRestoreValidationResult,
    actions: ["backup:PutRestoreValidationResult"],
}));
//# sourceMappingURL=PutRestoreValidationResultHttp.js.map