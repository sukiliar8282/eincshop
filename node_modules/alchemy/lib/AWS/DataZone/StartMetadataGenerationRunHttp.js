import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { StartMetadataGenerationRun } from "./StartMetadataGenerationRun.js";
export const StartMetadataGenerationRunHttp = Layer.effect(StartMetadataGenerationRun, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.StartMetadataGenerationRun",
    operation: datazone.startMetadataGenerationRun,
    actions: ["datazone:StartMetadataGenerationRun"],
}));
//# sourceMappingURL=StartMetadataGenerationRunHttp.js.map