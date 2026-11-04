import * as signer from "@distilled.cloud/aws/signer";
import * as Layer from "effect/Layer";
import { makeSignerHttpBinding } from "./BindingHttp.js";
import { DescribeSigningJob } from "./DescribeSigningJob.js";
export const DescribeSigningJobHttp = Layer.effect(DescribeSigningJob, makeSignerHttpBinding({
    tag: "AWS.Signer.DescribeSigningJob",
    operation: signer.describeSigningJob,
    actions: ["signer:DescribeSigningJob"],
}));
//# sourceMappingURL=DescribeSigningJobHttp.js.map