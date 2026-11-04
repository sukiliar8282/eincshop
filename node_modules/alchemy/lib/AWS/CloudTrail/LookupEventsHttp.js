import * as cloudtrail from "@distilled.cloud/aws/cloudtrail";
import * as Layer from "effect/Layer";
import { makeCloudTrailAccountHttpBinding } from "./BindingHttp.js";
import { LookupEvents } from "./LookupEvents.js";
export const LookupEventsHttp = Layer.effect(LookupEvents, makeCloudTrailAccountHttpBinding({
    tag: "AWS.CloudTrail.LookupEvents",
    operation: cloudtrail.lookupEvents,
    actions: ["cloudtrail:LookupEvents"],
}));
//# sourceMappingURL=LookupEventsHttp.js.map