import * as osis from "@distilled.cloud/aws/osis";
import * as Layer from "effect/Layer";
import { makeOsisAccountHttpBinding } from "./BindingHttp.js";
import { ListPipelineBlueprints } from "./ListPipelineBlueprints.js";
export const ListPipelineBlueprintsHttp = Layer.effect(ListPipelineBlueprints, makeOsisAccountHttpBinding({
    tag: "AWS.OSIS.ListPipelineBlueprints",
    operation: osis.listPipelineBlueprints,
    actions: ["osis:ListPipelineBlueprints"],
}));
//# sourceMappingURL=ListPipelineBlueprintsHttp.js.map