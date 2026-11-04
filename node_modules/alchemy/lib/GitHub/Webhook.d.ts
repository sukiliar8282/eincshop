import * as Redacted from "effect/Redacted";
import type { Input } from "../Input.ts";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type * as GitHub from "./Providers.ts";
import type { WebhookEventName } from "./RepositoryEventSource.ts";
export interface WebhookProps {
    /**
     * Repository owner (user or organization).
     */
    owner: string;
    /**
     * Repository name.
     */
    repository: string;
    /**
     * The URL that GitHub will `POST` events to. Accepts an `Output<string>`
     * (e.g. a Cloudflare Worker's `url`) so the webhook can target a
     * resource provisioned in the same stack.
     */
    url: Input<string>;
    /**
     * GitHub event names to subscribe to (e.g. `["push", "pull_request"]`).
     * Use `["*"]` to receive every event GitHub emits.
     * @default ["push"]
     */
    events?: WebhookEventName[];
    /**
     * Secret used to sign each delivery with `HMAC-SHA256`. The signature is
     * sent in the `X-Hub-Signature-256` header so the receiver can verify the
     * payload originated from GitHub. Wrap with `Redacted.make` to keep it out
     * of logs and state.
     */
    secret?: Redacted.Redacted<string>;
    /**
     * Payload media type.
     * @default "json"
     */
    contentType?: "json" | "form";
    /**
     * Whether deliveries are active.
     * @default true
     */
    active?: boolean;
    /**
     * Skip TLS verification of the delivery URL (`insecure_ssl`). Only use for
     * local/testing endpoints.
     * @default false
     */
    insecureSsl?: boolean;
    /**
     * Override the GitHub host or API base URL for this resource only (e.g.
     * `github.example.com` for GitHub Enterprise). Falls back to
     * `GitHub.providers({ baseUrl })`, then to the host resolved by the auth
     * provider. Changing it replaces the resource — the same name on a
     * different GitHub instance is a different physical resource.
     */
    baseUrl?: string;
}
export interface Webhook extends Resource<"GitHub.Webhook", WebhookProps, {
    /**
     * Numeric ID of the webhook in GitHub.
     */
    webhookId: number;
    /**
     * The configured delivery URL.
     */
    url: string;
    /**
     * URL used by GitHub to send a `ping` event.
     */
    pingUrl: string | undefined;
    /**
     * URL used by GitHub to re-deliver the last event.
     */
    testUrl: string | undefined;
    /**
     * ISO-8601 timestamp of the last update.
     */
    updatedAt: string;
}, never, GitHub.Providers> {
}
/**
 * A GitHub repository webhook.
 *
 * `Webhook` manages the lifecycle of a repository webhook that `POST`s
 * events to a delivery URL. It is created on the first deploy and updated
 * in place on subsequent deploys, and is deleted when the resource is
 * destroyed.
 *
 * Authentication is resolved via the `GitHubCredentials` service supplied
 * by `GitHub.providers()` (env, stored PAT, or `gh` CLI). The token needs
 * `repo` scope (admin access to the repository) to manage webhooks.
 *
 * Most users don't construct `Webhook` directly — prefer
 * {@link import("./RepositoryEventSource.ts").events | events(repository, handler)}
 * inside a Cloudflare Worker, which provisions the webhook, wires the
 * delivery URL to the Worker, and forwards verified events to your handler.
 * ### Creating a Webhook
 * **Example:** Forward push events to a URL
 * ```typescript
 * yield* GitHub.Webhook("ci-webhook", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   url: "https://example.com/github",
 *   events: ["push", "pull_request"],
 *   secret: Redacted.make(process.env.WEBHOOK_SECRET!),
 * });
 * ```
 *
 * **Example:** Point a webhook at a Worker
 * ```typescript
 * const worker = yield* Cloudflare.Worker("Api", { ... });
 *
 * yield* GitHub.Webhook("repo-webhook", {
 *   owner: "my-org",
 *   repository: "my-repo",
 *   url: worker.url!,
 *   events: ["*"],
 * });
 * ```
 *
 * @resource
 */
export declare const Webhook: import("../Resource.ts").ResourceClass<Webhook>;
export declare const WebhookProvider: () => import("effect/Layer").Layer<Provider.Provider<Webhook>, never, GitHub.GitHubCredentials>;
//# sourceMappingURL=Webhook.d.ts.map