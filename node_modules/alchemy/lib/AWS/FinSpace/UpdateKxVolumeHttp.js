import * as finspace from "@distilled.cloud/aws/finspace";
import * as Layer from "effect/Layer";
import { makeFinSpaceKxHttpBinding } from "./BindingHttp.js";
import { UpdateKxVolume } from "./UpdateKxVolume.js";
export const UpdateKxVolumeHttp = Layer.effect(UpdateKxVolume, makeFinSpaceKxHttpBinding({
    tag: "AWS.FinSpace.UpdateKxVolume",
    operation: finspace.updateKxVolume,
    actions: ["finspace:UpdateKxVolume"],
}));
//# sourceMappingURL=UpdateKxVolumeHttp.js.map