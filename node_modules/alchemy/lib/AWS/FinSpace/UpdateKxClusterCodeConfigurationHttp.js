import * as finspace from "@distilled.cloud/aws/finspace";
import * as Layer from "effect/Layer";
import { makeFinSpaceKxHttpBinding } from "./BindingHttp.js";
import { UpdateKxClusterCodeConfiguration } from "./UpdateKxClusterCodeConfiguration.js";
export const UpdateKxClusterCodeConfigurationHttp = Layer.effect(UpdateKxClusterCodeConfiguration, makeFinSpaceKxHttpBinding({
    tag: "AWS.FinSpace.UpdateKxClusterCodeConfiguration",
    operation: finspace.updateKxClusterCodeConfiguration,
    actions: ["finspace:UpdateKxClusterCodeConfiguration"],
}));
//# sourceMappingURL=UpdateKxClusterCodeConfigurationHttp.js.map