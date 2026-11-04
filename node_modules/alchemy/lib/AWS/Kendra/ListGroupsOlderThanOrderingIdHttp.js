import * as kendra from "@distilled.cloud/aws/kendra";
import * as Layer from "effect/Layer";
import { makeKendraIndexHttpBinding } from "./BindingHttp.js";
import { ListGroupsOlderThanOrderingId } from "./ListGroupsOlderThanOrderingId.js";
export const ListGroupsOlderThanOrderingIdHttp = Layer.effect(ListGroupsOlderThanOrderingId, makeKendraIndexHttpBinding({
    tag: "AWS.Kendra.ListGroupsOlderThanOrderingId",
    operation: kendra.listGroupsOlderThanOrderingId,
    actions: ["kendra:ListGroupsOlderThanOrderingId"],
    subResources: ["data-source/*"],
}));
//# sourceMappingURL=ListGroupsOlderThanOrderingIdHttp.js.map