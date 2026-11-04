import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type { Input } from "../Input.ts";
import type { Environment } from "./Environment.ts";
import { Secret } from "./Secret.ts";
export interface SecretsProps {
    /**
     * Repository owner (user or organization).
     */
    owner: string;
    /**
     * Repository name.
     */
    repository: string;
    /**
     * Optional environment. When set every secret is scoped to that GitHub
     * Actions environment instead of the whole repository. Accepts an
     * environment name or a `GitHub.Environment` resource.
     */
    environment?: string | Environment;
    /**
     * Map of secret name to value. Plain strings are wrapped with
     * `Redacted.make`; already-redacted values are passed through.
     */
    secrets: Record<string, Input<string | Redacted.Redacted<string>>>;
}
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
export declare const Secrets: ({ owner, repository, environment, secrets, }: SecretsProps) => Effect.Effect<Secret[], never, import("./Providers.ts").Providers>;
//# sourceMappingURL=Secrets.d.ts.map