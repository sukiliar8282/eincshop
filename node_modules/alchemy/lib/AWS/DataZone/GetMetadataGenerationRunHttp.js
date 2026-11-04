import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { GetMetadataGenerationRun } from "./GetMetadataGenerationRun.js";
export const GetMetadataGenerationRunHttp = Layer.effect(GetMetadataGenerationRun, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.GetMetadataGenerationRun",
    operation: datazone.getMetadataGenerationRun,
    actions: ["datazone:GetMetadataGenerationRun"],
}));
//# sourceMappingURL=GetMetadataGenerationRunHttp.js.map