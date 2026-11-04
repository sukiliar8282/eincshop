import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineQueueSearchHttpBinding } from "./BindingHttp.js";
import { SearchJobs } from "./SearchJobs.js";
export const SearchJobsHttp = Layer.effect(SearchJobs, makeDeadlineQueueSearchHttpBinding({
    tag: "AWS.Deadline.SearchJobs",
    operation: deadline.searchJobs,
    actions: ["deadline:SearchJobs"],
}));
//# sourceMappingURL=SearchJobsHttp.js.map