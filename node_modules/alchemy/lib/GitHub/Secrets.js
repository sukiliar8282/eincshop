import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Output from "../Output.js";
import { Secret } from "./Secret.js";
/**
 * Bulk-creates a set of {@link Secret}s in the same repository (and
 * optionally the same environment).
 *
 * Each entry in `secrets` becomes one `GitHub.Secret` resource, using the
 * map key as both the alchemy logical id and the secret name.
 * **Example:** Example
 * ```ts
 * yield* GitHub.Secrets({
 *   owner: "my-org",
 *   repository: "my-repo",
 *   secrets: {
 *     AXIOM_INGEST_TOKEN: tokenValue,
 *     AXIOM_DATASET_TRACES: traces.name,
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Secrets = ({ owner, repository, environment, secrets, }) => Effect.all(Object.entries(secrets).map(([name, value]) => Secret(name, {
    owner,
    repository,
    environment,
    name,
    value: liftValue(value),
})));
// Accepts a plain string, an existing `Redacted<string>`, or a lazy `Input`
// of either. We must lift through lazy inputs so the inner string gets wrapped
// after the engine resolves it — otherwise `Redacted.make(input)` produces an
// opaque `Redacted<Config | Effect | Output>` that the plan cannot resolve.
const liftValue = (value) => Config.isConfig(value)
    ? Config.map(value, toRedacted)
    : Effect.isEffect(value)
        ? Effect.map(value, toRedacted)
        : Output.isOutput(value)
            ? Output.map(value, toRedacted)
            : toRedacted(value);
const toRedacted = (value) => Redacted.isRedacted(value)
    ? value
    : Redacted.make(value);
//# sourceMappingURL=Secrets.js.map