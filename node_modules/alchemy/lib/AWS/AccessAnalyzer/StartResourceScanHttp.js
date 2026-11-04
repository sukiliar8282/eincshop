import * as aa from "@distilled.cloud/aws/accessanalyzer";
import * as Layer from "effect/Layer";
import { makeAnalyzerScopedHttpBinding } from "./BindingHttp.js";
import { StartResourceScan } from "./StartResourceScan.js";
export const StartResourceScanHttp = Layer.effect(StartResourceScan, makeAnalyzerScopedHttpBinding({
    tag: "AWS.AccessAnalyzer.StartResourceScan",
    operation: aa.startResourceScan,
    actions: ["access-analyzer:StartResourceScan"],
}));
//# sourceMappingURL=StartResourceScanHttp.js.map