import * as Layer from "effect/Layer";
import { ListEventIntegrationAssociations } from "./ListEventIntegrationAssociations.ts";
/**
 * HTTP implementation of {@link ListEventIntegrationAssociations}. At deploy
 * time it grants `app-integrations:ListEventIntegrationAssociations` on the
 * event integration (and its `event-integration-association/*` children); at
 * runtime it calls the AppIntegrations API with the host Function's
 * credentials, injecting the event integration's name. Provide this layer on
 * the Function using the binding.
 */
export declare const ListEventIntegrationAssociationsHttp: Layer.Layer<ListEventIntegrationAssociations, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListEventIntegrationAssociationsHttp.d.ts.map