import * as glue from "@distilled.cloud/aws/glue";
import * as Layer from "effect/Layer";
import { makeGlueCrawlerHttpBinding } from "./BindingHttp.js";
import { StartCrawler } from "./StartCrawler.js";
export const StartCrawlerHttp = Layer.effect(StartCrawler, makeGlueCrawlerHttpBinding({
    tag: "AWS.Glue.StartCrawler",
    operation: glue.startCrawler,
    actions: ["glue:StartCrawler"],
}));
//# sourceMappingURL=StartCrawlerHttp.js.map