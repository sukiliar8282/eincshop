import * as efs from "@distilled.cloud/aws/efs";
import * as Layer from "effect/Layer";
import { makeEfsFileSystemHttpBinding } from "./BindingHttp.js";
import { PutBackupPolicy } from "./PutBackupPolicy.js";
export const PutBackupPolicyHttp = Layer.effect(PutBackupPolicy, makeEfsFileSystemHttpBinding({
    tag: "AWS.EFS.PutBackupPolicy",
    operation: efs.putBackupPolicy,
    actions: ["elasticfilesystem:PutBackupPolicy"],
}));
//# sourceMappingURL=PutBackupPolicyHttp.js.map