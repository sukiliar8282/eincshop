import * as SD from "@distilled.cloud/aws/servicediscovery";
import * as Layer from "effect/Layer";
import { makeCloudMapServiceHttpBinding } from "./BindingHttp.js";
import { ListInstances } from "./ListInstances.js";
export const ListInstancesHttp = Layer.effect(ListInstances, makeCloudMapServiceHttpBinding({
    tag: "AWS.CloudMap.ListInstances",
    operation: SD.listInstances,
    actions: ["servicediscovery:ListInstances"],
}));
//# sourceMappingURL=ListInstancesHttp.js.map