import * as ecr from "@distilled.cloud/aws/ecr";
import * as Layer from "effect/Layer";
import { makeEcrRepositoryHttpBinding } from "./BindingHttp.js";
import { StartImageScan } from "./StartImageScan.js";
/** HTTP implementation of {@link StartImageScan} over the ECR API. */
export const StartImageScanHttp = Layer.effect(StartImageScan, makeEcrRepositoryHttpBinding({
    capability: "StartImageScan",
    operation: ecr.startImageScan,
    iamActions: ["ecr:StartImageScan"],
}));
//# sourceMappingURL=StartImageScanHttp.js.map