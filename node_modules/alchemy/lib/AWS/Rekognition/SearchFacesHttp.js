import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { SearchFaces } from "./SearchFaces.js";
export const SearchFacesHttp = Layer.effect(SearchFaces, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.SearchFaces",
    operation: rekognition.searchFaces,
    actions: ["rekognition:SearchFaces"],
}));
//# sourceMappingURL=SearchFacesHttp.js.map