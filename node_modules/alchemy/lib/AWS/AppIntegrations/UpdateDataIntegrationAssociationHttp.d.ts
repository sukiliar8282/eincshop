import * as Layer from "effect/Layer";
import { UpdateDataIntegrationAssociation } from "./UpdateDataIntegrationAssociation.ts";
/**
 * HTTP implementation of {@link UpdateDataIntegrationAssociation}. At deploy
 * time it grants `app-integrations:UpdateDataIntegrationAssociation` on the
 * data integration (and its `data-integration-association/*` children); at
 * runtime it calls the AppIntegrations API with the host Function's
 * credentials, injecting the data integration's id. Provide this layer on
 * the Function using the binding.
 */
export declare const UpdateDataIntegrationAssociationHttp: Layer.Layer<UpdateDataIntegrationAssociation, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=UpdateDataIntegrationAssociationHttp.d.ts.map