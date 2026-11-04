import * as mediapackagev2 from "@distilled.cloud/aws/mediapackagev2";
import * as Layer from "effect/Layer";
import { makeMediaPackageV2ChannelGroupHttpBinding } from "./BindingHttp.js";
import { ListHarvestJobs } from "./ListHarvestJobs.js";
export const ListHarvestJobsHttp = Layer.effect(ListHarvestJobs, makeMediaPackageV2ChannelGroupHttpBinding({
    tag: "AWS.MediaPackageV2.ListHarvestJobs",
    operation: mediapackagev2.listHarvestJobs,
    actions: ["mediapackagev2:ListHarvestJobs"],
}));
//# sourceMappingURL=ListHarvestJobsHttp.js.map