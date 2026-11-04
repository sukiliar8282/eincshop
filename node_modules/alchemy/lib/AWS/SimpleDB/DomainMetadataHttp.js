import * as sdb from "@distilled.cloud/aws/simpledb";
import * as Layer from "effect/Layer";
import { makeSimpleDbBinding } from "./Binding.js";
import { DomainMetadata } from "./DomainMetadata.js";
export const DomainMetadataHttp = Layer.effect(DomainMetadata, makeSimpleDbBinding({
    operation: "DomainMetadata",
    method: sdb.domainMetadata,
}));
//# sourceMappingURL=DomainMetadataHttp.js.map