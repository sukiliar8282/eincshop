import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { ListClassificationJobs } from "./ListClassificationJobs.js";
export const ListClassificationJobsHttp = Layer.effect(ListClassificationJobs, makeMacie2HttpBinding({
    tag: "AWS.Macie2.ListClassificationJobs",
    operation: macie2.listClassificationJobs,
    actions: ["macie2:ListClassificationJobs"],
}));
//# sourceMappingURL=ListClassificationJobsHttp.js.map