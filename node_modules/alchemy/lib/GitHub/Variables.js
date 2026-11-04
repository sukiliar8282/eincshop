import * as Effect from "effect/Effect";
import { Variable } from "./Variable.js";
/**
 * Bulk-creates a set of {@link Variable}s in the same repository.
 *
 * Plural counterpart of {@link import("./Secrets.ts").Secrets}, for
 * non-sensitive values like region names, role ARNs, environment labels,
 * or feature flags.
 * **Example:** Example
 * ```ts
 * yield* GitHub.Variables({
 *   owner: "my-org",
 *   repository: "my-repo",
 *   variables: {
 *     AWS_ROLE_ARN: role.roleArn,
 *     AWS_REGION: region,
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Variables = ({ owner, repository, environment, variables, }) => Effect.all(Object.entries(variables).map(([name, value]) => Variable(name, {
    owner,
    repository,
    environment,
    name,
    value,
})));
//# sourceMappingURL=Variables.js.map