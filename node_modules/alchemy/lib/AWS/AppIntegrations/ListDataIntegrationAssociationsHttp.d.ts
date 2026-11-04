import * as Layer from "effect/Layer";
import { ListDataIntegrationAssociations } from "./ListDataIntegrationAssociations.ts";
/**
 * HTTP implementation of {@link ListDataIntegrationAssociations}. At deploy
 * time it grants `app-integrations:ListDataIntegrationAssociations` on the
 * data integration (and its `data-integration-association/*` children); at
 * runtime it calls the AppIntegrations API with the host Function's
 * credentials, injecting the data integration's id. Provide this layer on
 * the Function using the binding.
 */
export declare const ListDataIntegrationAssociationsHttp: Layer.Layer<ListDataIntegrationAssociations, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListDataIntegrationAssociationsHttp.d.ts.map