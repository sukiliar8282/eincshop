import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { ListSteps } from "./ListSteps.js";
export const ListStepsHttp = Layer.effect(ListSteps, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.ListSteps",
    operation: emr.listSteps,
    actions: ["elasticmapreduce:ListSteps"],
}));
//# sourceMappingURL=ListStepsHttp.js.map