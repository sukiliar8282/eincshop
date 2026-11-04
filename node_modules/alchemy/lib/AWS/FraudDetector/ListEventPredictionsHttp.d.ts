import * as Layer from "effect/Layer";
import { ListEventPredictions } from "./ListEventPredictions.ts";
/**
 * Bespoke implementation — unlike the other detector-scoped operations, the
 * detector is a `FilterCondition` (`{ value }`) rather than a plain
 * `detectorId` field, and `frauddetector:ListEventPredictions` supports no
 * resource-level IAM scoping, so the grant is on `*`.
 */
export declare const ListEventPredictionsHttp: Layer.Layer<ListEventPredictions, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListEventPredictionsHttp.d.ts.map