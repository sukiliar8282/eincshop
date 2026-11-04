import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrAccountHttpBinding } from "./BindingHttp.js";
import { ListSupportedInstanceTypes } from "./ListSupportedInstanceTypes.js";
export const ListSupportedInstanceTypesHttp = Layer.effect(ListSupportedInstanceTypes, makeEmrAccountHttpBinding({
    tag: "AWS.EMR.ListSupportedInstanceTypes",
    operation: emr.listSupportedInstanceTypes,
    actions: ["elasticmapreduce:ListSupportedInstanceTypes"],
}));
//# sourceMappingURL=ListSupportedInstanceTypesHttp.js.map