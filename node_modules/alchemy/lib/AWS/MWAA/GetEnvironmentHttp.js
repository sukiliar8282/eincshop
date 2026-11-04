import * as mwaa from "@distilled.cloud/aws/mwaa";
import * as Layer from "effect/Layer";
import { makeMWAAEnvironmentHttpBinding } from "./BindingHttp.js";
import { GetEnvironment } from "./GetEnvironment.js";
export const GetEnvironmentHttp = Layer.effect(GetEnvironment, makeMWAAEnvironmentHttpBinding({
    tag: "AWS.MWAA.GetEnvironment",
    operation: mwaa.getEnvironment,
    actions: ["airflow:GetEnvironment"],
}));
//# sourceMappingURL=GetEnvironmentHttp.js.map