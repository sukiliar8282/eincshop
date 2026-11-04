import * as Layer from "effect/Layer";
import { ListEventIntegrations } from "./ListEventIntegrations.ts";
/**
 * HTTP implementation of {@link ListEventIntegrations}. At deploy time it
 * grants `app-integrations:ListEventIntegrations`; at runtime it calls the
 * AppIntegrations API with the host Function's credentials. Provide this
 * layer on the Function using the binding.
 */
export declare const ListEventIntegrationsHttp: Layer.Layer<ListEventIntegrations, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListEventIntegrationsHttp.d.ts.map