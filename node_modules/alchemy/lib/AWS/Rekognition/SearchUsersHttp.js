import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { SearchUsers } from "./SearchUsers.js";
export const SearchUsersHttp = Layer.effect(SearchUsers, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.SearchUsers",
    operation: rekognition.searchUsers,
    actions: ["rekognition:SearchUsers"],
}));
//# sourceMappingURL=SearchUsersHttp.js.map