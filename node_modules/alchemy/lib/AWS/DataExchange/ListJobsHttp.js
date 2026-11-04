import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeDataExchangeAccountHttpBinding } from "./BindingHttp.js";
import { ListJobs } from "./ListJobs.js";
export const ListJobsHttp = Layer.effect(ListJobs, makeDataExchangeAccountHttpBinding({
    tag: "AWS.DataExchange.ListJobs",
    operation: dataexchange.listJobs,
    actions: ["dataexchange:ListJobs"],
}));
//# sourceMappingURL=ListJobsHttp.js.map