import * as mediaconvert from "@distilled.cloud/aws/mediaconvert";
import * as Layer from "effect/Layer";
import { makeMediaConvertHttpBinding } from "./BindingHttp.js";
import { ListJobs } from "./ListJobs.js";
export const ListJobsHttp = Layer.effect(ListJobs, makeMediaConvertHttpBinding({
    capability: "ListJobs",
    iamActions: ["mediaconvert:ListJobs"],
    operation: mediaconvert.listJobs,
}));
//# sourceMappingURL=ListJobsHttp.js.map