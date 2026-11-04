import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { awaitVisible, retryWhileResourceInUse } from "./internal.js";
/**
 * Associates a Service Catalog product with a portfolio, making the product
 * launchable by the portfolio's principals.
 *
 * ### Associating a Product
 * **Example:** Add a product to a portfolio
 * ```typescript
 * import * as ServiceCatalog from "alchemy/AWS/ServiceCatalog";
 *
 * yield* ServiceCatalog.PortfolioProductAssociation("ToolsVpc", {
 *   portfolioId: portfolio.portfolioId,
 *   productId: product.productId,
 * });
 * ```
 *
 * @resource
 */
export const PortfolioProductAssociation = Resource("AWS.ServiceCatalog.PortfolioProductAssociation");
export const PortfolioProductAssociationProvider = () => Provider.effect(PortfolioProductAssociation, Effect.gen(function* () {
    // Enumerate the product's portfolios and check for ours. A missing
    // product means the association is gone too.
    const isAssociated = Effect.fn(function* (productId, portfolioId) {
        return yield* servicecatalog.listPortfoliosForProduct
            .pages({ ProductId: productId })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            .flatMap((page) => page.PortfolioDetails ?? [])
            .some((d) => d.Id === portfolioId)), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(false)));
    });
    return PortfolioProductAssociation.Provider.of({
        stables: ["portfolioId", "productId"],
        // Service Catalog has no account-wide association API. Walk every
        // product and enumerate its portfolios so unsafe nuke can remove
        // associations before attempting to delete their parents.
        list: () => Effect.gen(function* () {
            const productIds = yield* servicecatalog.searchProductsAsAdmin
                .pages({})
                .pipe(Stream.runCollect, Effect.map((pages) => Array.from(pages)
                .flatMap((page) => page.ProductViewDetails ?? [])
                .flatMap((detail) => {
                const productId = detail.ProductViewSummary?.ProductId;
                return productId === undefined ? [] : [productId];
            })));
            const associations = yield* Effect.forEach(productIds, (productId) => servicecatalog.listPortfoliosForProduct
                .pages({ ProductId: productId })
                .pipe(Stream.runCollect, Effect.map((pages) => Array.from(pages)
                .flatMap((page) => page.PortfolioDetails ?? [])
                .flatMap((portfolio) => portfolio.Id === undefined
                ? []
                : [{ productId, portfolioId: portfolio.Id }])), 
            // A product can disappear between the account-wide walk
            // and association hydration.
            Effect.catchTag("ResourceNotFoundException", () => Effect.succeed([]))), { concurrency: 5 });
            return associations.flat();
        }),
        // Existence-only resource — every property is part of its identity.
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            if (olds.portfolioId !== news.portfolioId ||
                olds.productId !== news.productId) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const portfolioId = output?.portfolioId ?? olds?.portfolioId;
            const productId = output?.productId ?? olds?.productId;
            if (portfolioId === undefined || productId === undefined) {
                return undefined;
            }
            return (yield* isAssociated(productId, portfolioId))
                ? { portfolioId, productId }
                : undefined;
        }),
        // Existence-only: observe → if missing, associate. No sync step.
        reconcile: Effect.fn(function* ({ news, session }) {
            if (!(yield* isAssociated(news.productId, news.portfolioId))) {
                yield* servicecatalog.associateProductWithPortfolio({
                    ProductId: news.productId,
                    PortfolioId: news.portfolioId,
                });
                // The association list is eventually consistent — wait (bounded)
                // until it is visible so a subsequent read converges.
                yield* awaitVisible(isAssociated(news.productId, news.portfolioId));
            }
            yield* session.note(`${news.portfolioId}/${news.productId}`);
            return {
                portfolioId: news.portfolioId,
                productId: news.productId,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            if (yield* isAssociated(output.productId, output.portfolioId)) {
                yield* retryWhileResourceInUse(servicecatalog.disassociateProductFromPortfolio({
                    ProductId: output.productId,
                    PortfolioId: output.portfolioId,
                })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            }
        }),
    });
}));
//# sourceMappingURL=PortfolioProductAssociation.js.map