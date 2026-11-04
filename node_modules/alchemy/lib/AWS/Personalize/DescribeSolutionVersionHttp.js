import * as personalize from "@distilled.cloud/aws/personalize";
import * as Layer from "effect/Layer";
import { makePersonalizeAccountHttpBinding } from "./BindingHttp.js";
import { DescribeSolutionVersion } from "./DescribeSolutionVersion.js";
export const DescribeSolutionVersionHttp = Layer.effect(DescribeSolutionVersion, makePersonalizeAccountHttpBinding({
    tag: "AWS.Personalize.DescribeSolutionVersion",
    operation: personalize.describeSolutionVersion,
    actions: ["personalize:DescribeSolutionVersion"],
}));
//# sourceMappingURL=DescribeSolutionVersionHttp.js.map