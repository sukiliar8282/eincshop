import * as efs from "@distilled.cloud/aws/efs";
import * as Layer from "effect/Layer";
import { makeEfsFileSystemHttpBinding } from "./BindingHttp.js";
import { PutLifecycleConfiguration } from "./PutLifecycleConfiguration.js";
export const PutLifecycleConfigurationHttp = Layer.effect(PutLifecycleConfiguration, makeEfsFileSystemHttpBinding({
    tag: "AWS.EFS.PutLifecycleConfiguration",
    operation: efs.putLifecycleConfiguration,
    actions: ["elasticfilesystem:PutLifecycleConfiguration"],
}));
//# sourceMappingURL=PutLifecycleConfigurationHttp.js.map