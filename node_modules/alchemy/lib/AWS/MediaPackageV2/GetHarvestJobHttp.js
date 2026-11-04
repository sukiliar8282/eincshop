import * as mediapackagev2 from "@distilled.cloud/aws/mediapackagev2";
import * as Layer from "effect/Layer";
import { makeMediaPackageV2OriginEndpointHttpBinding } from "./BindingHttp.js";
import { GetHarvestJob } from "./GetHarvestJob.js";
export const GetHarvestJobHttp = Layer.effect(GetHarvestJob, makeMediaPackageV2OriginEndpointHttpBinding({
    tag: "AWS.MediaPackageV2.GetHarvestJob",
    operation: mediapackagev2.getHarvestJob,
    actions: ["mediapackagev2:GetHarvestJob"],
    harvestJobScoped: true,
}));
//# sourceMappingURL=GetHarvestJobHttp.js.map