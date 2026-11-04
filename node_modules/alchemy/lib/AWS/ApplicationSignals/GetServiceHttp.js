import * as appsignals from "@distilled.cloud/aws/application-signals";
import * as Layer from "effect/Layer";
import { makeApplicationSignalsAccountHttpBinding } from "./BindingHttp.js";
import { GetService } from "./GetService.js";
export const GetServiceHttp = Layer.effect(GetService, makeApplicationSignalsAccountHttpBinding({
    tag: "AWS.ApplicationSignals.GetService",
    operation: appsignals.getService,
    actions: ["application-signals:GetService"],
}));
//# sourceMappingURL=GetServiceHttp.js.map