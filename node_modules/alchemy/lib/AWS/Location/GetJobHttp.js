import * as location from "@distilled.cloud/aws/location";
import * as Layer from "effect/Layer";
import { makeLocationAccountHttpBinding } from "./BindingHttp.js";
import { GetJob } from "./GetJob.js";
export const GetJobHttp = Layer.effect(GetJob, makeLocationAccountHttpBinding({
    tag: "AWS.Location.GetJob",
    operation: location.getJob,
    actions: ["geo:GetJob"],
}));
//# sourceMappingURL=GetJobHttp.js.map