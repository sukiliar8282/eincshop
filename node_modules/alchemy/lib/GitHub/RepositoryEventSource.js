import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { sanitizeKey } from "../RuntimeContext.js";
export function consumeRepositoryEvents(propsOrProcess, maybeProcess) {
    const [props, process] = typeof propsOrProcess === "function"
        ? [{}, propsOrProcess]
        : [propsOrProcess, maybeProcess];
    return RepositoryEventSource.use((source) => source(props, process));
}
export class RepositoryEventSource extends Context.Service()("GitHub.RepositoryEventSource") {
}
/**
 * Deterministic delivery path for a repository's webhook. Shared by the
 * deploy-time policy (which registers the webhook URL) and the runtime
 * (which only claims requests on this path), so both sides agree.
 */
export const webhookPath = (props) => props.path ?? `/__alchemy/github/${props.owner}/${props.repository}`;
/**
 * Deterministic env var name under which the deploy-time policy stores the
 * webhook secret on the host, so the runtime can read it back to verify
 * signatures.
 */
export const webhookSecretEnvName = (repository) => `ALCHEMY_GITHUB_WEBHOOK_SECRET_${sanitizeKey(repository.owner)}_${sanitizeKey(repository.repository)}`;
//# sourceMappingURL=RepositoryEventSource.js.map