import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type PrincipalType = "IAM" | "IAM_PATTERN";
export interface PrincipalPortfolioAssociationProps {
    /**
     * ID of the portfolio to grant access to. Changing it replaces the
     * association.
     */
    portfolioId: string;
    /**
     * ARN of the IAM principal (user, group, or role) — or an ARN pattern
     * with wildcards when `principalType` is `IAM_PATTERN`. Changing it
     * replaces the association.
     */
    principalArn: string;
    /**
     * Whether `principalArn` is a concrete IAM ARN (`IAM`) or a wildcard
     * pattern (`IAM_PATTERN`). Changing it replaces the association.
     * @default "IAM"
     */
    principalType?: PrincipalType;
}
export interface PrincipalPortfolioAssociation extends Resource<"AWS.ServiceCatalog.PrincipalPortfolioAssociation", PrincipalPortfolioAssociationProps, {
    /** ID of the portfolio. */
    portfolioId: string;
    /** ARN (or pattern) of the associated principal. */
    principalArn: string;
    /** The principal type of the association. */
    principalType: PrincipalType;
}, never, Providers> {
}
/**
 * Grants an IAM principal (user, group, or role) access to a Service
 * Catalog portfolio, allowing it to browse and launch the portfolio's
 * products.
 *
 * ### Granting Access
 * **Example:** Associate an IAM role
 * ```typescript
 * import * as ServiceCatalog from "alchemy/AWS/ServiceCatalog";
 *
 * yield* ServiceCatalog.PrincipalPortfolioAssociation("DevAccess", {
 *   portfolioId: portfolio.portfolioId,
 *   principalArn: role.roleArn,
 * });
 * ```
 *
 * **Example:** Associate a wildcard principal pattern
 * ```typescript
 * yield* ServiceCatalog.PrincipalPortfolioAssociation("AllDevRoles", {
 *   portfolioId: portfolio.portfolioId,
 *   principalArn: "arn:aws:iam:::role/dev-*",
 *   principalType: "IAM_PATTERN",
 * });
 * ```
 *
 * @resource
 */
export declare const PrincipalPortfolioAssociation: import("../../Resource.ts").ResourceClass<PrincipalPortfolioAssociation>;
export declare const PrincipalPortfolioAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<PrincipalPortfolioAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=PrincipalPortfolioAssociation.d.ts.map