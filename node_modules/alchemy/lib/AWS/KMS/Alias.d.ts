import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
import type { KeyArn, KeyId } from "./Key.ts";
export type AliasName = `alias/${string}`;
export type AliasArn = `arn:aws:kms:${RegionID}:${AccountID}:${AliasName}`;
export interface AliasProps {
    /**
     * Alias name. Must begin with `alias/`. If omitted, Alchemy generates one.
     */
    aliasName?: AliasName;
    /**
     * Target KMS key ID or ARN for this alias.
     */
    targetKeyId: KeyId | KeyArn;
}
export interface Alias extends Resource<"AWS.KMS.Alias", AliasProps, {
    aliasName: AliasName;
    aliasArn: AliasArn;
    targetKeyId: KeyId;
}, never, Providers> {
}
/**
 * An AWS KMS alias that points to a customer managed key.
 *
 * ### Creating Aliases
 * **Example:** Alias for a Key
 * ```typescript
 * import * as KMS from "alchemy/AWS/KMS";
 *
 * const key = yield* KMS.Key("AppKey");
 * const alias = yield* KMS.Alias("AppAlias", {
 *   aliasName: "alias/app",
 *   targetKeyId: key.keyId,
 * });
 * ```
 */
export declare const Alias: import("../../Resource.ts").ResourceClass<Alias>;
export declare const AliasProvider: () => import("effect/Layer").Layer<Provider.Provider<Alias>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Alias.d.ts.map