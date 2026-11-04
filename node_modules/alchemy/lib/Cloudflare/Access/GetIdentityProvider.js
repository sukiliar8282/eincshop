import * as Binding from "../../Binding.js";
export const GetIdentityProvider = Binding.Service("Cloudflare.Access.GetIdentityProvider");
/**
 * Plan-time identity-provider lookup — the data-source form of
 * {@link GetIdentityProvider} (what Terraform calls a data source and
 * Pulumi an invoke). Returns an
 * `Output<IdentityProviderAttributes | undefined>` resolved during
 * plan/deploy; safe to call from composition code that is re-executed
 * inside a deployed runtime bundle.
 */
export const getIdentityProvider = GetIdentityProvider.execute;
//# sourceMappingURL=GetIdentityProvider.js.map