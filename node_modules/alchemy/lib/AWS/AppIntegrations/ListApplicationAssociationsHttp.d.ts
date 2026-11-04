import * as Layer from "effect/Layer";
import { ListApplicationAssociations } from "./ListApplicationAssociations.ts";
/**
 * HTTP implementation of {@link ListApplicationAssociations}. At deploy time
 * it grants `app-integrations:ListApplicationAssociations` on the application
 * (and its `application-association/*` children); at runtime it calls the
 * AppIntegrations API with the host Function's credentials, injecting the
 * application's id. Provide this layer on the Function using the binding.
 */
export declare const ListApplicationAssociationsHttp: Layer.Layer<ListApplicationAssociations, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListApplicationAssociationsHttp.d.ts.map