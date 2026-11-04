import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationCollectionHttpBinding } from "./BindingHttp.js";
import { ListGeofences } from "./ListGeofences.js";
export const ListGeofencesHttp = Layer.effect(ListGeofences, makeLocationCollectionHttpBinding({
    tag: "AWS.Location.ListGeofences",
    operation: location.listGeofences,
    actions: ["geo:ListGeofences"],
}));
//# sourceMappingURL=ListGeofencesHttp.js.map