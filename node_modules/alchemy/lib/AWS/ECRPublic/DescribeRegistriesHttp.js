import * as ecrpublic from "@distilled.cloud/aws/ecr-public";
import * as Layer from "effect/Layer";
import { makePublicRegistryHttpBinding } from "./BindingHttp.js";
import { DescribeRegistries } from "./DescribeRegistries.js";
export const DescribeRegistriesHttp = Layer.effect(DescribeRegistries, makePublicRegistryHttpBinding({
    capability: "DescribeRegistries",
    iamActions: ["ecr-public:DescribeRegistries"],
    operation: ecrpublic.describeRegistries,
}));
//# sourceMappingURL=DescribeRegistriesHttp.js.map