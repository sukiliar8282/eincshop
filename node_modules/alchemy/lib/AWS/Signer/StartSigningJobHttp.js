import * as signer from "@distilled.cloud/aws/signer";
import * as Layer from "effect/Layer";
import { makeSignerProfileHttpBinding } from "./BindingHttp.js";
import { StartSigningJob } from "./StartSigningJob.js";
export const StartSigningJobHttp = Layer.effect(StartSigningJob, makeSignerProfileHttpBinding({
    tag: "AWS.Signer.StartSigningJob",
    operation: signer.startSigningJob,
    actions: ["signer:StartSigningJob"],
}));
//# sourceMappingURL=StartSigningJobHttp.js.map