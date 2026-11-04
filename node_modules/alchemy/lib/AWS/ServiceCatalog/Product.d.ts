import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type ProductType = "CLOUD_FORMATION_TEMPLATE" | "EXTERNAL" | "TERRAFORM_OPEN_SOURCE" | "TERRAFORM_CLOUD" | "MARKETPLACE";
export interface ProvisioningArtifactProps {
    /**
     * Name of the provisioning artifact (product version), e.g. `v1`.
     * Updatable in place.
     * @default "v1"
     */
    name?: string;
    /**
     * Description of the provisioning artifact. Updatable in place.
     */
    description?: string;
    /**
     * HTTPS S3 URL of the CloudFormation template for this version, e.g.
     * `https://my-bucket.s3.us-west-2.amazonaws.com/template.json`.
     * Changing the template URL replaces the product.
     */
    templateUrl: string;
    /**
     * Skips CloudFormation template validation at create time.
     * @default false
     */
    disableTemplateValidation?: boolean;
}
export interface ProductProps {
    /**
     * Name of the product. If omitted, a unique name is generated from the
     * app, stage, and logical ID. Name changes are applied in place.
     */
    productName?: string;
    /**
     * The owner of the product (person, team, or organization). Updatable
     * in place.
     */
    owner: string;
    /**
     * Description of the product. Updatable in place.
     */
    description?: string;
    /**
     * The distributor of the product. Updatable in place.
     */
    distributor?: string;
    /**
     * Support information about the product. Updatable in place.
     */
    supportDescription?: string;
    /**
     * Contact email for product support. Updatable in place.
     */
    supportEmail?: string;
    /**
     * Contact URL for product support. Must be an `https` URL. Updatable
     * in place.
     */
    supportUrl?: string;
    /**
     * The type of product. Changing it replaces the product.
     * @default "CLOUD_FORMATION_TEMPLATE"
     */
    productType?: ProductType;
    /**
     * The initial provisioning artifact (product version) created with the
     * product. Changing its `templateUrl` replaces the product.
     */
    provisioningArtifact: ProvisioningArtifactProps;
    /**
     * Tags to apply to the product. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Product extends Resource<"AWS.ServiceCatalog.Product", ProductProps, {
    /** The auto-generated product ID (e.g. `prod-abc123`). */
    productId: string;
    /** The ARN of the product. */
    productArn: string;
    /** The name of the product. */
    productName: string;
    /** The ID of the provisioning artifact created with the product. */
    provisioningArtifactId: string;
}, never, Providers> {
}
/**
 * An AWS Service Catalog product — a CloudFormation-backed offering
 * (or Terraform/external equivalent) with one or more provisioning
 * artifacts (versions) that principals can launch from a portfolio.
 *
 * ### Creating a Product
 * **Example:** CloudFormation Product
 * ```typescript
 * import * as ServiceCatalog from "alchemy/AWS/ServiceCatalog";
 *
 * const product = yield* ServiceCatalog.Product("VpcProduct", {
 *   owner: "platform-team",
 *   description: "Standard VPC baseline",
 *   provisioningArtifact: {
 *     name: "v1",
 *     templateUrl: "https://my-bucket.s3.us-west-2.amazonaws.com/vpc.json",
 *   },
 * });
 * ```
 *
 * **Example:** Product with Support Information
 * ```typescript
 * const product = yield* ServiceCatalog.Product("VpcProduct", {
 *   owner: "platform-team",
 *   supportEmail: "platform@example.com",
 *   supportUrl: "https://wiki.example.com/vpc-product",
 *   supportDescription: "Slack #platform for questions",
 *   provisioningArtifact: {
 *     templateUrl: "https://my-bucket.s3.us-west-2.amazonaws.com/vpc.json",
 *   },
 * });
 * ```
 *
 * ### Publishing to a Portfolio
 * **Example:** Associate the product with a portfolio
 * ```typescript
 * yield* ServiceCatalog.PortfolioProductAssociation("ToolsVpc", {
 *   portfolioId: portfolio.portfolioId,
 *   productId: product.productId,
 * });
 * ```
 *
 * @resource
 */
export declare const Product: import("../../Resource.ts").ResourceClass<Product>;
export declare const ProductProvider: () => import("effect/Layer").Layer<Provider.Provider<Product>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Product.d.ts.map