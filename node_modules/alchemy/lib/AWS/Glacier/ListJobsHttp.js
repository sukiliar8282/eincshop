import * as glacier from "@distilled.cloud/aws/glacier";
import * as Layer from "effect/Layer";
import { makeGlacierVaultHttpBinding } from "./BindingHttp.js";
import { ListJobs } from "./ListJobs.js";
export const ListJobsHttp = Layer.effect(ListJobs, makeGlacierVaultHttpBinding({
    tag: "AWS.Glacier.ListJobs",
    operation: glacier.listJobs,
    actions: ["glacier:ListJobs"],
}));
//# sourceMappingURL=ListJobsHttp.js.map