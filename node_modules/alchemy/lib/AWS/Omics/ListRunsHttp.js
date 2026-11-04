import * as omics from "@distilled.cloud/aws/omics";
import * as Layer from "effect/Layer";
import { makeOmicsAccountHttpBinding } from "./BindingHttp.js";
import { ListRuns } from "./ListRuns.js";
export const ListRunsHttp = Layer.effect(ListRuns, makeOmicsAccountHttpBinding({
    tag: "AWS.Omics.ListRuns",
    operation: omics.listRuns,
    actions: ["omics:ListRuns"],
}));
//# sourceMappingURL=ListRunsHttp.js.map