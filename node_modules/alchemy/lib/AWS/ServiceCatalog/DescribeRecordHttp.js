import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Layer from "effect/Layer";
import { makeServiceCatalogHttpBinding } from "./BindingHttp.js";
import { DescribeRecord } from "./DescribeRecord.js";
export const DescribeRecordHttp = Layer.effect(DescribeRecord, makeServiceCatalogHttpBinding({
    capability: "DescribeRecord",
    iamActions: ["servicecatalog:DescribeRecord"],
    operation: servicecatalog.describeRecord,
}));
//# sourceMappingURL=DescribeRecordHttp.js.map