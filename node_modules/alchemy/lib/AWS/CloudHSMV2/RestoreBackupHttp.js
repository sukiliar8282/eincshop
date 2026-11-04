import * as cloudhsm from "@distilled.cloud/aws/cloudhsm-v2";
import * as Layer from "effect/Layer";
import { makeCloudHsmHttpBinding } from "./BindingHttp.js";
import { RestoreBackup } from "./RestoreBackup.js";
export const RestoreBackupHttp = Layer.effect(RestoreBackup, makeCloudHsmHttpBinding({
    tag: "AWS.CloudHSMV2.RestoreBackup",
    operation: cloudhsm.restoreBackup,
    actions: ["cloudhsm:RestoreBackup"],
}));
//# sourceMappingURL=RestoreBackupHttp.js.map