import * as Layer from "effect/Layer";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import { GetIdentityProvider } from "./GetIdentityProvider.ts";
/**
 * HTTP implementation of the {@link GetIdentityProvider} binding.
 *
 * When bound inside a Worker, it mints a scoped {@link AccountApiToken}
 * with the `Access: Organizations, Identity Providers, and Groups Read`
 * permission and binds its outputs into the Worker so runtime code can
 * call the Access API. Hostless — the plan-time `execute` data source
 * ({@link getIdentityProvider}) or an Action — it runs with the ambient
 * current credentials instead; no token is minted.
 */
export declare const GetIdentityProviderHttp: Layer.Layer<GetIdentityProvider, never, CloudflareEnvironment>;
//# sourceMappingURL=GetIdentityProviderHttp.d.ts.map