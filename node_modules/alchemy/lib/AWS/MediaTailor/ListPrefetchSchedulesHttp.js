import * as mediatailor from "@distilled.cloud/aws/mediatailor";
import * as Layer from "effect/Layer";
import { makeMediaTailorPlaybackHttpBinding } from "./BindingHttp.js";
import { ListPrefetchSchedules } from "./ListPrefetchSchedules.js";
export const ListPrefetchSchedulesHttp = Layer.effect(ListPrefetchSchedules, makeMediaTailorPlaybackHttpBinding({
    capability: "ListPrefetchSchedules",
    iamActions: ["mediatailor:ListPrefetchSchedules"],
    operation: mediatailor.listPrefetchSchedules,
}));
//# sourceMappingURL=ListPrefetchSchedulesHttp.js.map