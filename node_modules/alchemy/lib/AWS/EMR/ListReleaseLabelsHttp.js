import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrAccountHttpBinding } from "./BindingHttp.js";
import { ListReleaseLabels } from "./ListReleaseLabels.js";
export const ListReleaseLabelsHttp = Layer.effect(ListReleaseLabels, makeEmrAccountHttpBinding({
    tag: "AWS.EMR.ListReleaseLabels",
    operation: emr.listReleaseLabels,
    actions: ["elasticmapreduce:ListReleaseLabels"],
}));
//# sourceMappingURL=ListReleaseLabelsHttp.js.map