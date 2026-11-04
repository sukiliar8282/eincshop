import * as amp from "@distilled.cloud/aws/amp";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import { isBindingHost } from "../Lambda/Function.js";
import { GetDefaultScraperConfiguration } from "./GetDefaultScraperConfiguration.js";
import { decodeDefinition } from "./internal.js";
export const GetDefaultScraperConfigurationHttp = Layer.effect(GetDefaultScraperConfiguration, Effect.gen(function* () {
    const getDefaultScraperConfiguration = yield* amp.getDefaultScraperConfiguration;
    return Effect.fn(function* () {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.AMP.GetDefaultScraperConfiguration())`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: ["aps:GetDefaultScraperConfiguration"],
                            Resource: ["*"],
                        },
                    ],
                });
            }
        }
        return Effect.fn("AWS.AMP.GetDefaultScraperConfiguration")(function* () {
            const response = yield* getDefaultScraperConfiguration({});
            return yield* decodeDefinition(response.configuration);
        });
    });
}));
//# sourceMappingURL=GetDefaultScraperConfigurationHttp.js.map