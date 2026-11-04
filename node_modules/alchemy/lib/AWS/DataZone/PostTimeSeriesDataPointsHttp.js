import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { PostTimeSeriesDataPoints } from "./PostTimeSeriesDataPoints.js";
export const PostTimeSeriesDataPointsHttp = Layer.effect(PostTimeSeriesDataPoints, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.PostTimeSeriesDataPoints",
    operation: datazone.postTimeSeriesDataPoints,
    actions: ["datazone:PostTimeSeriesDataPoints"],
}));
//# sourceMappingURL=PostTimeSeriesDataPointsHttp.js.map