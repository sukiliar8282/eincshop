import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { SearchUsersByImage } from "./SearchUsersByImage.js";
export const SearchUsersByImageHttp = Layer.effect(SearchUsersByImage, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.SearchUsersByImage",
    operation: rekognition.searchUsersByImage,
    actions: ["rekognition:SearchUsersByImage"],
}));
//# sourceMappingURL=SearchUsersByImageHttp.js.map