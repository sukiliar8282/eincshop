import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AliasProps {
    /**
     * The alias name. Must begin with `alias/` and may contain alphanumeric
     * characters, forward slashes, underscores and hyphens. Changing it
     * replaces the alias.
     * @default alias/${app}-${stage}-${id}
     */
    aliasName?: string;
    /**
     * The ARN of the key the alias points to. Omit to create an unattached
     * alias; set later to point it at a key. Updated in place.
     */
    keyArn?: string;
}
export interface Alias extends Resource<"AWS.PaymentCryptography.Alias", AliasProps, {
    /**
     * Name of the alias (starts with `alias/`).
     */
    aliasName: string;
    /**
     * ARN of the key the alias points to, if attached.
     */
    keyArn: string | undefined;
}, never, Providers> {
}
/**
 * A friendly name for an AWS Payment Cryptography {@link Key}. Aliases give
 * keys a stable, human-readable identifier that survives key rotation — the
 * alias can be repointed to a new key without touching consumers.
 * ### Creating Aliases
 * **Example:** Alias attached to a key
 * ```typescript
 * import * as PaymentCryptography from "alchemy/AWS/PaymentCryptography";
 *
 * const key = yield* PaymentCryptography.Key("DataKey", { keyAttributes: { ... } });
 * const alias = yield* PaymentCryptography.Alias("DataKeyAlias", {
 *   keyArn: key.keyArn,
 * });
 * ```
 *
 * **Example:** Alias with an explicit name
 * ```typescript
 * const alias = yield* PaymentCryptography.Alias("DataKeyAlias", {
 *   aliasName: "alias/payments/data-encryption",
 *   keyArn: key.keyArn,
 * });
 * ```
 *
 * @resource
 */
export declare const Alias: import("../../Resource.ts").ResourceClass<Alias>;
export declare const AliasProvider: () => import("effect/Layer").Layer<Provider.Provider<Alias>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Alias.d.ts.map