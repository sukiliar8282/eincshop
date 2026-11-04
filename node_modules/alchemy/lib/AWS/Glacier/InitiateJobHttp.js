import * as glacier from "@distilled.cloud/aws/glacier";
import * as Layer from "effect/Layer";
import { makeGlacierVaultHttpBinding } from "./BindingHttp.js";
import { InitiateJob } from "./InitiateJob.js";
export const InitiateJobHttp = Layer.effect(InitiateJob, makeGlacierVaultHttpBinding({
    tag: "AWS.Glacier.InitiateJob",
    operation: glacier.initiateJob,
    actions: ["glacier:InitiateJob"],
}));
//# sourceMappingURL=InitiateJobHttp.js.map