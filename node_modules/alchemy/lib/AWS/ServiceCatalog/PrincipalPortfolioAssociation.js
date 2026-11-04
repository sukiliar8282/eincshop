import * as servicecatalog from "@distilled.cloud/aws/service-catalog";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { awaitVisible } from "./internal.js";
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
export const PrincipalPortfolioAssociation = Resource("AWS.ServiceCatalog.PrincipalPortfolioAssociation");
export const PrincipalPortfolioAssociationProvider = () => Provider.effect(PrincipalPortfolioAssociation, Effect.gen(function* () {
    // Enumerate the portfolio's principals and check for ours. A missing
    // portfolio means the association is gone too.
    const isAssociated = Effect.fn(function* (portfolioId, principalArn) {
        return yield* servicecatalog.listPrincipalsForPortfolio
            .pages({ PortfolioId: portfolioId })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            .flatMap((page) => page.Principals ?? [])
            .some((p) => p.PrincipalARN === principalArn)), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(false)));
    });
    return PrincipalPortfolioAssociation.Provider.of({
        stables: ["portfolioId", "principalArn", "principalType"],
        // Service Catalog has no account-wide principal-association API. Walk
        // every portfolio so unsafe nuke can remove principals before their
        // parent portfolios. AWS may replace the ARN of a deleted IAM role
        // with its stable principal ID (ARO...); preserve that value because
        // the disassociate API accepts it.
        list: () => Effect.gen(function* () {
            const portfolioIds = yield* servicecatalog.listPortfolios
                .pages({})
                .pipe(Stream.runCollect, Effect.map((pages) => Array.from(pages)
                .flatMap((page) => page.PortfolioDetails ?? [])
                .flatMap((portfolio) => portfolio.Id === undefined ? [] : [portfolio.Id])));
            const associations = yield* Effect.forEach(portfolioIds, (portfolioId) => servicecatalog.listPrincipalsForPortfolio
                .pages({ PortfolioId: portfolioId })
                .pipe(Stream.runCollect, Effect.map((pages) => Array.from(pages)
                .flatMap((page) => page.Principals ?? [])
                .flatMap((principal) => {
                if (principal.PrincipalARN === undefined)
                    return [];
                const principalType = principal.PrincipalType === "IAM"
                    ? "IAM"
                    : principal.PrincipalType === "IAM_PATTERN"
                        ? "IAM_PATTERN"
                        : undefined;
                if (principalType === undefined)
                    return [];
                return [
                    {
                        portfolioId,
                        principalArn: principal.PrincipalARN,
                        principalType,
                    },
                ];
            })), 
            // A portfolio can disappear between enumeration and
            // association hydration.
            Effect.catchTag("ResourceNotFoundException", () => Effect.succeed([]))), { concurrency: 5 });
            return associations.flat();
        }),
        // Existence-only resource — every property is part of its identity.
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            if (olds.portfolioId !== news.portfolioId ||
                olds.principalArn !== news.principalArn ||
                (olds.principalType ?? "IAM") !== (news.principalType ?? "IAM")) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const portfolioId = output?.portfolioId ?? olds?.portfolioId;
            const principalArn = output?.principalArn ?? olds?.principalArn;
            if (portfolioId === undefined || principalArn === undefined) {
                return undefined;
            }
            return (yield* isAssociated(portfolioId, principalArn))
                ? {
                    portfolioId,
                    principalArn,
                    principalType: output?.principalType ?? olds?.principalType ?? "IAM",
                }
                : undefined;
        }),
        // Existence-only: observe → if missing, associate. No sync step.
        reconcile: Effect.fn(function* ({ news, session }) {
            const principalType = news.principalType ?? "IAM";
            if (!(yield* isAssociated(news.portfolioId, news.principalArn))) {
                yield* servicecatalog.associatePrincipalWithPortfolio({
                    PortfolioId: news.portfolioId,
                    PrincipalARN: news.principalArn,
                    PrincipalType: principalType,
                });
                // The principal list is eventually consistent — wait (bounded)
                // until the association is visible so a subsequent read converges.
                yield* awaitVisible(isAssociated(news.portfolioId, news.principalArn));
            }
            yield* session.note(`${news.portfolioId}/${news.principalArn}`);
            return {
                portfolioId: news.portfolioId,
                principalArn: news.principalArn,
                principalType,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            if (yield* isAssociated(output.portfolioId, output.principalArn)) {
                yield* servicecatalog
                    .disassociatePrincipalFromPortfolio({
                    PortfolioId: output.portfolioId,
                    PrincipalARN: output.principalArn,
                    PrincipalType: output.principalType,
                })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            }
        }),
    });
}));
//# sourceMappingURL=PrincipalPortfolioAssociation.js.map