import * as signer from "@distilled.cloud/aws/signer";
import * as Layer from "effect/Layer";
import { makeSignerHttpBinding } from "./BindingHttp.js";
import { ListSigningJobs } from "./ListSigningJobs.js";
export const ListSigningJobsHttp = Layer.effect(ListSigningJobs, makeSignerHttpBinding({
    tag: "AWS.Signer.ListSigningJobs",
    operation: signer.listSigningJobs,
    actions: ["signer:ListSigningJobs"],
}));
//# sourceMappingURL=ListSigningJobsHttp.js.map