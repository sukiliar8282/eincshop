import * as TSW from "@distilled.cloud/aws/timestream-write";
import * as Layer from "effect/Layer";
import { makeWriteTableHttpBinding } from "./BindingHttp.js";
import { WriteRecords } from "./WriteRecords.js";
export const WriteRecordsHttp = Layer.effect(WriteRecords, makeWriteTableHttpBinding({
    tag: "AWS.Timestream.WriteRecords",
    operation: TSW.writeRecords,
    actions: ["timestream:WriteRecords"],
    toRequest: (request, names) => ({
        ...request,
        ...names,
    }),
}));
//# sourceMappingURL=WriteRecordsHttp.js.map