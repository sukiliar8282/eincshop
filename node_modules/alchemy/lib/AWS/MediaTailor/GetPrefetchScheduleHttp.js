import * as mediatailor from "@distilled.cloud/aws/mediatailor";
import * as Layer from "effect/Layer";
import { makeMediaTailorPlaybackHttpBinding } from "./BindingHttp.js";
import { GetPrefetchSchedule } from "./GetPrefetchSchedule.js";
export const GetPrefetchScheduleHttp = Layer.effect(GetPrefetchSchedule, makeMediaTailorPlaybackHttpBinding({
    capability: "GetPrefetchSchedule",
    iamActions: ["mediatailor:GetPrefetchSchedule"],
    operation: mediatailor.getPrefetchSchedule,
}));
//# sourceMappingURL=GetPrefetchScheduleHttp.js.map