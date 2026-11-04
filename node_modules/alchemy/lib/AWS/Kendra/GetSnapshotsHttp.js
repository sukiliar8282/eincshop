import * as kendra from "@distilled.cloud/aws/kendra";
import * as Layer from "effect/Layer";
import { makeKendraIndexHttpBinding } from "./BindingHttp.js";
import { GetSnapshots } from "./GetSnapshots.js";
export const GetSnapshotsHttp = Layer.effect(GetSnapshots, makeKendraIndexHttpBinding({
    tag: "AWS.Kendra.GetSnapshots",
    operation: kendra.getSnapshots,
    actions: ["kendra:GetSnapshots"],
}));
//# sourceMappingURL=GetSnapshotsHttp.js.map