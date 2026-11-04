import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { ListResourceProfileArtifacts } from "./ListResourceProfileArtifacts.js";
export const ListResourceProfileArtifactsHttp = Layer.effect(ListResourceProfileArtifacts, makeMacie2HttpBinding({
    tag: "AWS.Macie2.ListResourceProfileArtifacts",
    operation: macie2.listResourceProfileArtifacts,
    actions: ["macie2:ListResourceProfileArtifacts"],
}));
//# sourceMappingURL=ListResourceProfileArtifactsHttp.js.map