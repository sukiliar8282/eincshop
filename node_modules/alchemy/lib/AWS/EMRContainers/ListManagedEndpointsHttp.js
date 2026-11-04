import * as emrc from "@distilled.cloud/aws/emr-containers";
import * as Layer from "effect/Layer";
import { makeEMRContainersVirtualClusterHttpBinding } from "./BindingHttp.js";
import { ListManagedEndpoints } from "./ListManagedEndpoints.js";
export const ListManagedEndpointsHttp = Layer.effect(ListManagedEndpoints, makeEMRContainersVirtualClusterHttpBinding({
    tag: "AWS.EMRContainers.ListManagedEndpoints",
    operation: emrc.listManagedEndpoints,
    actions: ["emr-containers:ListManagedEndpoints"],
}));
//# sourceMappingURL=ListManagedEndpointsHttp.js.map