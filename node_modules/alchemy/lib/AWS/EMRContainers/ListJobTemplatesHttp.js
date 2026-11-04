import * as emrc from "@distilled.cloud/aws/emr-containers";
import * as Layer from "effect/Layer";
import { makeEMRContainersAccountHttpBinding } from "./BindingHttp.js";
import { ListJobTemplates } from "./ListJobTemplates.js";
export const ListJobTemplatesHttp = Layer.effect(ListJobTemplates, makeEMRContainersAccountHttpBinding({
    tag: "AWS.EMRContainers.ListJobTemplates",
    operation: emrc.listJobTemplates,
    actions: ["emr-containers:ListJobTemplates"],
}));
//# sourceMappingURL=ListJobTemplatesHttp.js.map