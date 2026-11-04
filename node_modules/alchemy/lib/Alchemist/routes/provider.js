import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { getEnv } from "../../Auth/Env.js";
import { resolveProfileName } from "../../Auth/Resolve.js";
import { loadConfigProvider } from "../../Util/ConfigProvider.js";
import { AlchemistInvalidInput } from "../Errors.js";
import { collectAuthProviders, DEFAULT_ENTRYPOINT, } from "../Session.js";
const satisfied = (variable) => Effect.gen(function* () {
    for (const name of [variable.name, ...(variable.alternatives ?? [])]) {
        const value = yield* getEnv(name);
        if (value !== undefined && value.length > 0)
            return true;
    }
    return false;
});
/**
 * Verify the environment variables each registered provider's CI contract
 * requires are present.
 */
export const checkEnvironment = Effect.fn("Alchemist.provider.checkEnvironment")(function* (input) {
    const profile = yield* resolveProfileName(Option.fromNullishOr(input.envFile), input.profile);
    const registry = yield* collectAuthProviders({
        main: input.entrypoint ?? DEFAULT_ENTRYPOINT,
        envFile: Option.fromNullishOr(input.envFile),
        profile,
    });
    const known = Object.keys(registry).sort();
    const names = yield* input.providers?.length
        ? Effect.forEach(input.providers, (requested) => {
            const name = known.find((candidate) => candidate.toLowerCase() === requested.toLowerCase());
            return name === undefined
                ? Effect.fail(new AlchemistInvalidInput({
                    field: "providers",
                    message: `Unknown provider '${requested}'. Registered: ${known.join(", ")}.`,
                }))
                : Effect.succeed(name);
        })
        : Effect.succeed(known);
    const checks = yield* Effect.forEach(names, (name) => Effect.gen(function* () {
        const contract = registry[name].environment;
        const missing = [];
        for (const variable of contract) {
            if (variable.required && !(yield* satisfied(variable))) {
                missing.push({
                    alternatives: [variable.name, ...(variable.alternatives ?? [])],
                });
            }
        }
        return {
            provider: name,
            status: contract.length === 0
                ? "no-contract"
                : missing.length === 0
                    ? "satisfied"
                    : "missing",
            missing,
        };
    })).pipe(Effect.provide(ConfigProvider.layer(yield* loadConfigProvider(Option.fromNullishOr(input.envFile)))));
    return {
        checks,
        satisfied: checks.every((check) => check.status !== "missing"),
    };
});
//# sourceMappingURL=provider.js.map