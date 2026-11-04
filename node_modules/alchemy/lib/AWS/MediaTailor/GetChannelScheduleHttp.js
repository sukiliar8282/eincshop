import * as mediatailor from "@distilled.cloud/aws/mediatailor";
import * as Layer from "effect/Layer";
import { makeMediaTailorHttpBinding } from "./BindingHttp.js";
import { GetChannelSchedule } from "./GetChannelSchedule.js";
export const GetChannelScheduleHttp = Layer.effect(GetChannelSchedule, makeMediaTailorHttpBinding({
    capability: "GetChannelSchedule",
    iamActions: ["mediatailor:GetChannelSchedule"],
    operation: mediatailor.getChannelSchedule,
}));
//# sourceMappingURL=GetChannelScheduleHttp.js.map