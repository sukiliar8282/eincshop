import * as glue from "@distilled.cloud/aws/glue";
import * as Layer from "effect/Layer";
import { makeGlueCrawlerHttpBinding } from "./BindingHttp.js";
import { StopCrawler } from "./StopCrawler.js";
export const StopCrawlerHttp = Layer.effect(StopCrawler, makeGlueCrawlerHttpBinding({
    tag: "AWS.Glue.StopCrawler",
    operation: glue.stopCrawler,
    actions: ["glue:StopCrawler"],
}));
//# sourceMappingURL=StopCrawlerHttp.js.map