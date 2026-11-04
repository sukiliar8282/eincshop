import * as glacier from "@distilled.cloud/aws/glacier";
import * as Layer from "effect/Layer";
import { makeGlacierVaultHttpBinding } from "./BindingHttp.js";
import { GetJobOutput } from "./GetJobOutput.js";
export const GetJobOutputHttp = Layer.effect(GetJobOutput, makeGlacierVaultHttpBinding({
    tag: "AWS.Glacier.GetJobOutput",
    operation: glacier.getJobOutput,
    actions: ["glacier:GetJobOutput"],
}));
//# sourceMappingURL=GetJobOutputHttp.js.map