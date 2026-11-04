import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { ListResourceProfileDetections } from "./ListResourceProfileDetections.js";
export const ListResourceProfileDetectionsHttp = Layer.effect(ListResourceProfileDetections, makeMacie2HttpBinding({
    tag: "AWS.Macie2.ListResourceProfileDetections",
    operation: macie2.listResourceProfileDetections,
    actions: ["macie2:ListResourceProfileDetections"],
}));
//# sourceMappingURL=ListResourceProfileDetectionsHttp.js.map