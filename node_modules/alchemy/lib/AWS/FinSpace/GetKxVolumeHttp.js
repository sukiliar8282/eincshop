import * as finspace from "@distilled.cloud/aws/finspace";
import * as Layer from "effect/Layer";
import { makeFinSpaceKxHttpBinding } from "./BindingHttp.js";
import { GetKxVolume } from "./GetKxVolume.js";
export const GetKxVolumeHttp = Layer.effect(GetKxVolume, makeFinSpaceKxHttpBinding({
    tag: "AWS.FinSpace.GetKxVolume",
    operation: finspace.getKxVolume,
    actions: ["finspace:GetKxVolume"],
}));
//# sourceMappingURL=GetKxVolumeHttp.js.map