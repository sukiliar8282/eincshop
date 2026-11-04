import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PortfolioProps {
    /**
     * Display name of the portfolio (1-100 characters). Portfolio display
     * names are not unique in an account; the portfolio's identity is its
     * auto-generated ID. If omitted, a unique name is generated from the app,
     * stage, and logical ID. Display name changes are applied in place.
     */
    displayName?: string;
    /**
     * Name of the person or organization that owns the portfolio
     * (for example a team name). Updatable in place.
     */
    providerName: string;
    /**
     * Description of the portfolio. Updatable in place.
     */
    description?: string;
    /**
     * Tags to apply to the portfolio. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Portfolio extends Resource<"AWS.ServiceCatalog.Portfolio", PortfolioProps, {
    /** The auto-generated portfolio ID (e.g. `port-abc123`). */
    portfolioId: string;
    /** The ARN of the portfolio. */
    portfolioArn: string;
    /** The display name of the portfolio. */
    portfolioName: string;
}, never, Providers> {
}
/**
 * An AWS Service Catalog portfolio — a container that organizes products
 * and grants access to them for a set of principals.
 *
 * ### Creating a Portfolio
 * **Example:** Basic Portfolio
 * ```typescript
 * import * as ServiceCatalog from "alchemy/AWS/ServiceCatalog";
 *
 * const portfolio = yield* ServiceCatalog.Portfolio("Tools", {
 *   providerName: "platform-team",
 * });
 * ```
 *
 * **Example:** Portfolio with Description and Tags
 * ```typescript
 * const portfolio = yield* ServiceCatalog.Portfolio("Tools", {
 *   displayName: "engineering-tools",
 *   providerName: "platform-team",
 *   description: "Self-service infrastructure for engineering",
 *   tags: { team: "platform" },
 * });
 * ```
 *
 * ### Granting Access
 * **Example:** Associate a principal (IAM role)
 * ```typescript
 * yield* ServiceCatalog.PrincipalPortfolioAssociation("DevAccess", {
 *   portfolioId: portfolio.portfolioId,
 *   principalArn: role.roleArn,
 * });
 * ```
 *
 * ### Adding Products
 * **Example:** Associate a product
 * ```typescript
 * yield* ServiceCatalog.PortfolioProductAssociation("ToolsVpcProduct", {
 *   portfolioId: portfolio.portfolioId,
 *   productId: product.productId,
 * });
 * ```
 *
 * @resource
 */
export declare const Portfolio: import("../../Resource.ts").ResourceClass<Portfolio>;
export declare const PortfolioProvider: () => import("effect/Layer").Layer<Provider.Provider<Portfolio>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Portfolio.d.ts.map