import * as cloudformation from "@distilled.cloud/aws/cloudformation";
import * as Layer from "effect/Layer";
import { makeCloudFormationStackHttpBinding } from "./BindingHttp.js";
import { ListStackResources } from "./ListStackResources.js";
export const ListStackResourcesHttp = Layer.effect(ListStackResources, makeCloudFormationStackHttpBinding({
    tag: "AWS.CloudFormation.ListStackResources",
    operation: cloudformation.listStackResources,
    actions: ["cloudformation:ListStackResources"],
}));
//# sourceMappingURL=ListStackResourcesHttp.js.map