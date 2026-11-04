import * as Layer from "effect/Layer";
import { ListApplications } from "./ListApplications.ts";
/**
 * HTTP implementation of {@link ListApplications}. At deploy time it grants
 * `app-integrations:ListApplications`; at runtime it calls the
 * AppIntegrations API with the host Function's credentials. Provide this
 * layer on the Function using the binding.
 */
export declare const ListApplicationsHttp: Layer.Layer<ListApplications, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListApplicationsHttp.d.ts.map