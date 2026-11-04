import * as personalizeevents from "@distilled.cloud/aws/personalize-events";
import * as Layer from "effect/Layer";
import { makePersonalizeDatasetHttpBinding } from "./BindingHttp.js";
import { PutUsers } from "./PutUsers.js";
export const PutUsersHttp = Layer.effect(PutUsers, makePersonalizeDatasetHttpBinding({
    tag: "AWS.Personalize.PutUsers",
    operation: personalizeevents.putUsers,
    actions: ["personalize:PutUsers"],
}));
//# sourceMappingURL=PutUsersHttp.js.map