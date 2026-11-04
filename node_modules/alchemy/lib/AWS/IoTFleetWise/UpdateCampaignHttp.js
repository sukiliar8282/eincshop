import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Layer from "effect/Layer";
import { makeFleetWiseResourceHttpBinding } from "./BindingHttp.js";
import { UpdateCampaign } from "./UpdateCampaign.js";
export const UpdateCampaignHttp = Layer.effect(UpdateCampaign, makeFleetWiseResourceHttpBinding({
    tag: "AWS.IoTFleetWise.UpdateCampaign",
    operation: iotfleetwise.updateCampaign,
    actions: ["iotfleetwise:UpdateCampaign"],
    requestKey: "name",
    identifier: (campaign) => campaign.campaignName,
    resources: (campaign) => [campaign.campaignArn],
}));
//# sourceMappingURL=UpdateCampaignHttp.js.map