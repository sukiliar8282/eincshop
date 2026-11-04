/**
 * Shared scaffolding for the OpenSearch domain data-plane bindings.
 *
 * An OpenSearch domain serves its search/index REST API under the domain's
 * `endpoint`, authorized by the IAM method actions (`es:ESHttpGet`,
 * `es:ESHttpPut`, …). There is no distilled operation for these — every
 * request is a SigV4-signed HTTP call (service `"es"`) made with the host
 * Function's own credentials.
 *
 * NOT exported from `index.ts` — only the per-capability contracts
 * (`DomainRead` / `DomainWrite` / `DomainReadWrite`) and their `*Http`
 * layers are public.
 */
import * as Credentials from "@distilled.cloud/aws/Credentials";
import * as Region from "@distilled.cloud/aws/Region";
import * as Effect from "effect/Effect";
import { OpenSearchApiError } from "./DataPlaneTypes.ts";
import type { Domain } from "./Domain.ts";
import type { ReadDomainClient } from "./DomainRead.ts";
import type { WriteDomainClient } from "./DomainWrite.ts";
/** One signed request against the domain's REST data plane. */
export interface OpenSearchHttpRequest {
    method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH";
    /** Path relative to the domain endpoint, e.g. `"songs/_search"`. */
    path: string;
    /** Query-string parameters (undefined values are skipped). */
    query?: Record<string, string | undefined>;
    /** JSON body (sent as `application/json`). */
    json?: unknown;
    /** Raw NDJSON body (used by `_bulk`; sent as `application/x-ndjson`). */
    ndjson?: string;
    /** Statuses (besides 2xx) whose body is returned instead of failing. */
    allowStatuses?: readonly number[];
}
/**
 * Signs and sends one {@link OpenSearchHttpRequest} and returns the parsed
 * JSON body (`undefined` for empty bodies, e.g. `HEAD` responses — check
 * `status` instead).
 */
export type OpenSearchSend = (request: OpenSearchHttpRequest) => Effect.Effect<{
    status: number;
    body: unknown;
}, OpenSearchApiError | Credentials.CredentialsError>;
/**
 * Build the shared body of an OpenSearch data-plane `*Http` binding layer:
 * resolve the ambient distilled `Credentials`/`Region` context once at layer
 * construction, register the least-privilege IAM statement on the host
 * Function at deploy time (`iamActions` on the domain and `domain/*`), and
 * hand a signed-request `send` function to the capability-specific
 * `makeClient`.
 */
export declare const makeOpenSearchDataPlaneBinding: <Client>(options: {
    /** Capability name used in the binding SID and trace spans, e.g. `"DomainRead"`. */
    name: string;
    /** IAM actions the capability requires, e.g. `["es:ESHttpGet"]`. */
    iamActions: string[];
    /** Build the typed runtime client from the signed-request sender. */
    makeClient: (send: OpenSearchSend) => Client;
}) => Effect.Effect<(domain: Domain) => Effect.Effect<Client, never, never>, never, Credentials.Credentials | Region.Region>;
/** Build the read half of the domain data-plane client. */
export declare const makeReadDomainClient: (send: OpenSearchSend) => ReadDomainClient;
/** Build the write half of the domain data-plane client. */
export declare const makeWriteDomainClient: (send: OpenSearchSend) => WriteDomainClient;
//# sourceMappingURL=DataPlaneHttp.d.ts.map