import * as databrew from "@distilled.cloud/aws/databrew";
import * as Layer from "effect/Layer";
import { makeDataBrewRecipeHttpBinding } from "./BindingHttp.js";
import { PublishRecipe } from "./PublishRecipe.js";
export const PublishRecipeHttp = Layer.effect(PublishRecipe, makeDataBrewRecipeHttpBinding({
    tag: "AWS.DataBrew.PublishRecipe",
    operation: databrew.publishRecipe,
    actions: ["databrew:PublishRecipe"],
}));
//# sourceMappingURL=PublishRecipeHttp.js.map