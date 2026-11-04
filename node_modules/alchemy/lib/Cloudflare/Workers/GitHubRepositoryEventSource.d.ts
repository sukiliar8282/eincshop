import * as Layer from "effect/Layer";
import { RepositoryEventSource } from "../../GitHub/RepositoryEventSource.ts";
import { Worker } from "./Worker.ts";
/**
 * GitHub event source for Cloudflare Workers.
 *
 * Deploy-time: provisions a {@link Webhook} on the repository whose delivery
 * URL points at this Worker (at a deterministic per-repo path). The webhook
 * secret is bound onto the Worker via an `Output` accessor so the runtime can
 * verify delivery signatures.
 *
 * Runtime: registers a `fetch` listener that claims requests on the
 * repository's delivery path, verifies the `HMAC-SHA256` signature against the
 * bound secret, and forwards each delivery to the subscriber. Requests on any
 * other path fall through to the Worker's own `fetch` handler.
 *
 * @binding
 * @product Workers
 * @category Workers & Compute
 */
export declare const GitHubRepositoryEventSourceLive: Layer.Layer<RepositoryEventSource, never, Worker<any>>;
//# sourceMappingURL=GitHubRepositoryEventSource.d.ts.map