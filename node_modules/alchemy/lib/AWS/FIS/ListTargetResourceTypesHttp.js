import * as fis from "@distilled.cloud/aws/fis";
import * as Layer from "effect/Layer";
import { makeFisAccountHttpBinding } from "./BindingHttp.js";
import { ListTargetResourceTypes } from "./ListTargetResourceTypes.js";
export const ListTargetResourceTypesHttp = Layer.effect(ListTargetResourceTypes, makeFisAccountHttpBinding({
    tag: "AWS.FIS.ListTargetResourceTypes",
    operation: fis.listTargetResourceTypes,
    actions: ["fis:ListTargetResourceTypes"],
}));
//# sourceMappingURL=ListTargetResourceTypesHttp.js.map