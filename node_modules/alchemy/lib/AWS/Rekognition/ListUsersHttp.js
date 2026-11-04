import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { ListUsers } from "./ListUsers.js";
export const ListUsersHttp = Layer.effect(ListUsers, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.ListUsers",
    operation: rekognition.listUsers,
    actions: ["rekognition:ListUsers"],
}));
//# sourceMappingURL=ListUsersHttp.js.map