import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags, hasAlchemyTags, tagRecord, } from "../../Tags.js";
import { idempotencyToken, retryWhileResourceInUse } from "./internal.js";
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
export const Product = Resource("AWS.ServiceCatalog.Product");
export const ProductProvider = () => Provider.effect(Product, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.productName ??
            (yield* createPhysicalName({ id, maxLength: 100 })));
    });
    // Observe by ID (typed NotFound → undefined), falling back to a
    // name lookup when state was lost.
    const observe = Effect.fn(function* (selector) {
        return yield* servicecatalog
            .describeProductAsAdmin(selector)
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const toAttributes = (described) => {
        const summary = described.ProductViewDetail?.ProductViewSummary;
        return {
            productId: summary?.ProductId ?? "",
            productArn: described.ProductViewDetail?.ProductARN ?? "",
            productName: summary?.Name ?? "",
            provisioningArtifactId: described.ProvisioningArtifactSummaries?.[0]?.Id ?? "",
        };
    };
    return Product.Provider.of({
        stables: ["productId", "productArn"],
        list: () => Effect.gen(function* () {
            const details = yield* servicecatalog.searchProductsAsAdmin
                .pages({})
                .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.ProductViewDetails ?? [])));
            const items = yield* Effect.forEach(details, (d) => {
                const productId = d.ProductViewSummary?.ProductId;
                if (productId === undefined ||
                    d.ProductARN === undefined ||
                    d.ProductViewSummary?.Name === undefined) {
                    return Effect.succeed(undefined);
                }
                // Hydrate the artifact ID; a product can vanish between
                // enumeration and hydration, so tolerate NotFound per item.
                return servicecatalog
                    .listProvisioningArtifacts({ ProductId: productId })
                    .pipe(Effect.map((r) => ({
                    productId,
                    productArn: d.ProductARN,
                    productName: d.ProductViewSummary.Name,
                    provisioningArtifactId: r.ProvisioningArtifactDetails?.[0]?.Id ?? "",
                })), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            }, { concurrency: 5 });
            return items.filter((item) => item !== undefined);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const described = output?.productId
                ? yield* observe({ Id: output.productId })
                : yield* observe({ Name: yield* createName(id, olds ?? {}) });
            if (!described?.ProductViewDetail?.ProductViewSummary?.ProductId) {
                return undefined;
            }
            const attrs = toAttributes(described);
            return (yield* hasAlchemyTags(id, tagRecord(described.Tags)))
                ? attrs
                : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            // The initial provisioning artifact's template and the product
            // type are immutable — changing either replaces the product.
            if (olds.provisioningArtifact?.templateUrl !==
                news.provisioningArtifact.templateUrl) {
                return { action: "replace" };
            }
            if ((olds.productType ?? "CLOUD_FORMATION_TEMPLATE") !==
                (news.productType ?? "CLOUD_FORMATION_TEMPLATE")) {
                return { action: "replace" };
            }
            // everything else is an in-place update
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session, instanceId, }) {
            const productName = yield* createName(id, news);
            const productType = news.productType ?? "CLOUD_FORMATION_TEMPLATE";
            const internalTags = yield* createInternalTags(id);
            const desiredTags = {
                ...news.tags,
                ...internalTags,
            };
            // 1. OBSERVE — by cached ID, falling back to the deterministic name.
            let described = output?.productId
                ? yield* observe({ Id: output.productId })
                : undefined;
            if (!described?.ProductViewDetail?.ProductViewSummary?.ProductId) {
                described = yield* observe({ Name: productName });
            }
            // 2. ENSURE — create when missing; the idempotency token (derived
            // from the instance ID) makes a retried create converge.
            if (!described?.ProductViewDetail?.ProductViewSummary?.ProductId) {
                const created = yield* servicecatalog.createProduct({
                    Name: productName,
                    Owner: news.owner,
                    Description: news.description,
                    Distributor: news.distributor,
                    SupportDescription: news.supportDescription,
                    SupportEmail: news.supportEmail,
                    SupportUrl: news.supportUrl,
                    ProductType: productType,
                    Tags: createTagsList(desiredTags),
                    ProvisioningArtifactParameters: {
                        Name: news.provisioningArtifact.name ?? "v1",
                        Description: news.provisioningArtifact.description,
                        Type: productType === "MARKETPLACE"
                            ? "MARKETPLACE_AMI"
                            : productType,
                        Info: {
                            LoadTemplateFromURL: news.provisioningArtifact.templateUrl,
                        },
                        DisableTemplateValidation: news.provisioningArtifact.disableTemplateValidation,
                    },
                    IdempotencyToken: idempotencyToken(instanceId),
                });
                described = yield* observe({
                    Id: created.ProductViewDetail.ProductViewSummary.ProductId,
                });
            }
            const summary = described.ProductViewDetail.ProductViewSummary;
            const productId = summary.ProductId;
            // 3a. SYNC product details + tags — diff observed against desired
            // and apply only the delta in a single updateProduct call.
            const observedTags = tagRecord(described.Tags);
            const { upsert, removed } = diffTags(observedTags, desiredTags);
            const changes = {};
            if (summary.Name !== productName)
                changes.Name = productName;
            if (summary.Owner !== news.owner)
                changes.Owner = news.owner;
            if (news.description !== undefined &&
                summary.ShortDescription !== news.description) {
                changes.Description = news.description;
            }
            if (news.distributor !== undefined &&
                summary.Distributor !== news.distributor) {
                changes.Distributor = news.distributor;
            }
            if (news.supportDescription !== undefined &&
                summary.SupportDescription !== news.supportDescription) {
                changes.SupportDescription = news.supportDescription;
            }
            if (news.supportEmail !== undefined &&
                summary.SupportEmail !== news.supportEmail) {
                changes.SupportEmail = news.supportEmail;
            }
            if (news.supportUrl !== undefined &&
                summary.SupportUrl !== news.supportUrl) {
                changes.SupportUrl = news.supportUrl;
            }
            if (Object.keys(changes).length > 0 ||
                upsert.length > 0 ||
                removed.length > 0) {
                yield* servicecatalog.updateProduct({
                    Id: productId,
                    ...changes,
                    AddTags: upsert.length > 0 ? upsert : undefined,
                    RemoveTags: removed.length > 0 ? removed : undefined,
                });
            }
            // 3b. SYNC the provisioning artifact's mutable fields (name and
            // description; the template itself is immutable → replacement).
            const artifact = described.ProvisioningArtifactSummaries?.[0];
            const provisioningArtifactId = output?.provisioningArtifactId ?? artifact?.Id ?? "";
            const desiredArtifactName = news.provisioningArtifact.name ?? "v1";
            if (artifact?.Id !== undefined &&
                (artifact.Name !== desiredArtifactName ||
                    (news.provisioningArtifact.description !== undefined &&
                        artifact.Description !== news.provisioningArtifact.description))) {
                yield* servicecatalog.updateProvisioningArtifact({
                    ProductId: productId,
                    ProvisioningArtifactId: artifact.Id,
                    Name: desiredArtifactName,
                    Description: news.provisioningArtifact.description,
                });
            }
            yield* session.note(productId);
            return {
                productId,
                productArn: described.ProductViewDetail.ProductARN,
                productName,
                provisioningArtifactId: artifact?.Id ?? provisioningArtifactId,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // A product still associated with a portfolio reports
            // ResourceInUseException; the disassociation settles asynchronously.
            yield* retryWhileResourceInUse(servicecatalog.deleteProduct({ Id: output.productId })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Product.js.map