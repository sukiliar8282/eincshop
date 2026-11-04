import * as cloudhsm from "@distilled.cloud/aws/cloudhsm-v2";
import * as Layer from "effect/Layer";
import { makeCloudHsmHttpBinding } from "./BindingHttp.js";
import { InitializeCluster } from "./InitializeCluster.js";
export const InitializeClusterHttp = Layer.effect(InitializeCluster, makeCloudHsmHttpBinding({
    tag: "AWS.CloudHSMV2.InitializeCluster",
    operation: cloudhsm.initializeCluster,
    actions: ["cloudhsm:InitializeCluster"],
}));
//# sourceMappingURL=InitializeClusterHttp.js.map