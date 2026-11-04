import * as emailRouting from "@distilled.cloud/cloudflare/email-routing";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type AddressProps = {
    /**
     * The email address to register as a verified destination on the
     * account. Cloudflare sends a verification email to this address; the
     * recipient must click the link before the address can receive routed
     * mail or be used as a verified sender.
     *
     * Changing this property triggers a replacement.
     */
    email: string;
};
export type Address = Resource<"Cloudflare.Email.Address", AddressProps, {
    addressId: string;
    email: string;
    accountId: string;
    verified: boolean;
    verifiedAt: string | undefined;
    created: string | undefined;
    modified: string | undefined;
}, never, Providers>;
/**
 * A verified destination email address on the account.
 *
 * Destination addresses are account-scoped (not zone-scoped). They are used
 * as forwarding targets in `Rule` actions and can also serve as the
 * `destinationAddress` on a `send_email` Worker binding.
 * ### Registering an Address
 * **Example:** Register a destination address
 * ```typescript
 * const ops = yield* Cloudflare.Email.Address("Ops", {
 *   email: "ops@example.com",
 * });
 * ```
 *
 * Cloudflare sends a verification email when the address is first created.
 * The address must be verified before it can receive routed mail.
 *
 * @resource
 * @product Email
 * @category Email
 */
export declare const Address: import("../../Resource.ts").ResourceClass<Address>;
export declare const AddressProvider: () => import("effect/Layer").Layer<Provider.Provider<Address>, never, CloudflareEnvironment | emailRouting.CloudflareOpContext>;
//# sourceMappingURL=Address.d.ts.map