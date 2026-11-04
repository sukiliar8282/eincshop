import * as frauddetector from "@distilled.cloud/aws/frauddetector";
import * as Layer from "effect/Layer";
import { makeFraudDetectorListHttpBinding } from "./BindingHttp.js";
import { UpdateList } from "./UpdateList.js";
export const UpdateListHttp = Layer.effect(UpdateList, makeFraudDetectorListHttpBinding({
    tag: "AWS.FraudDetector.UpdateList",
    operation: frauddetector.updateList,
    actions: ["frauddetector:UpdateList"],
}));
//# sourceMappingURL=UpdateListHttp.js.map