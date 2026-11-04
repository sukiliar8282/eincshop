import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneEnvironmentHttpBinding } from "./BindingHttp.js";
import { GetEnvironmentCredentials } from "./GetEnvironmentCredentials.js";
export const GetEnvironmentCredentialsHttp = Layer.effect(GetEnvironmentCredentials, makeDataZoneEnvironmentHttpBinding({
    tag: "AWS.DataZone.GetEnvironmentCredentials",
    operation: datazone.getEnvironmentCredentials,
    actions: ["datazone:GetEnvironmentCredentials"],
}));
//# sourceMappingURL=GetEnvironmentCredentialsHttp.js.map