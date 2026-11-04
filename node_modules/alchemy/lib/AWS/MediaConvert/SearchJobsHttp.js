import * as mediaconvert from "@distilled.cloud/aws/mediaconvert";
import * as Layer from "effect/Layer";
import { makeMediaConvertHttpBinding } from "./BindingHttp.js";
import { SearchJobs } from "./SearchJobs.js";
export const SearchJobsHttp = Layer.effect(SearchJobs, makeMediaConvertHttpBinding({
    capability: "SearchJobs",
    iamActions: ["mediaconvert:SearchJobs"],
    operation: mediaconvert.searchJobs,
}));
//# sourceMappingURL=SearchJobsHttp.js.map