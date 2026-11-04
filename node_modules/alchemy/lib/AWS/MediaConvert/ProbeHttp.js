import * as mediaconvert from "@distilled.cloud/aws/mediaconvert";
import * as Layer from "effect/Layer";
import { makeMediaConvertHttpBinding } from "./BindingHttp.js";
import { Probe } from "./Probe.js";
export const ProbeHttp = Layer.effect(Probe, makeMediaConvertHttpBinding({
    capability: "Probe",
    iamActions: ["mediaconvert:Probe"],
    operation: mediaconvert.probe,
}));
//# sourceMappingURL=ProbeHttp.js.map