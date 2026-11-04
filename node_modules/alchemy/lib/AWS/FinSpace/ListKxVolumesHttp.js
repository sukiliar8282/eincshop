import * as finspace from "@distilled.cloud/aws/finspace";
import * as Layer from "effect/Layer";
import { makeFinSpaceKxHttpBinding } from "./BindingHttp.js";
import { ListKxVolumes } from "./ListKxVolumes.js";
export const ListKxVolumesHttp = Layer.effect(ListKxVolumes, makeFinSpaceKxHttpBinding({
    tag: "AWS.FinSpace.ListKxVolumes",
    operation: finspace.listKxVolumes,
    actions: ["finspace:ListKxVolumes"],
}));
//# sourceMappingURL=ListKxVolumesHttp.js.map