import * as pages from "@distilled.cloud/cloudflare/pages";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Pages.Domain";
/**
 * A custom domain attached to a Cloudflare Pages project.
 *
 * Attaching a domain starts Cloudflare's validation flow: the domain must
 * resolve to the project (typically via a CNAME record pointing at the
 * project's `*.pages.dev` subdomain) before its status becomes `active`.
 * The resource does not wait for activation — compose it with
 * `Cloudflare.DNS.Record` to create the CNAME, and certificate issuance
 * completes asynchronously.
 *
 * Both properties are the attachment's identity, so every change triggers a
 * replacement (detach + attach).
 * ### Attaching a Domain
 * **Example:** Custom domain with its CNAME record
 * ```typescript
 * const project = yield* Cloudflare.Pages.Project("site", {});
 *
 * const domain = yield* Cloudflare.Pages.Domain("site-domain", {
 *   projectName: project.name,
 *   name: "www.example.com",
 * });
 *
 * yield* Cloudflare.DNS.Record("site-cname", {
 *   zoneId: zone.zoneId,
 *   name: "www.example.com",
 *   type: "CNAME",
 *   content: project.subdomain,
 *   proxied: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/pages/configuration/custom-domains/
 *
 * @resource
 * @product Pages
 * @category Workers & Compute
 */
export const Domain = Resource(TypeId);
/**
 * Returns true if the given value is a Domain resource.
 */
export const isDomain = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const DomainProvider = () => Provider.succeed(Domain, {
    stables: [
        "domainId",
        "accountId",
        "projectName",
        "name",
        "zoneTag",
        "createdOn",
    ],
    diff: Effect.fn(function* ({ olds, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const o = olds;
        const n = news;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // The domain name is the attachment's identity — no rename API.
        const oldName = output?.name ?? o?.name;
        if (oldName !== undefined && oldName !== n.name) {
            return { action: "replace" };
        }
        // projectName is Input<string>; compare only once both sides are
        // concrete strings.
        const oldProject = output?.projectName ??
            (typeof o?.projectName === "string" ? o.projectName : undefined);
        if (oldProject !== undefined &&
            typeof n.projectName === "string" &&
            oldProject !== n.projectName) {
            return { action: "replace" };
        }
        return undefined;
    }),
    // Parent fan-out: domains are sub-resources of a Pages project, and
    // there is no account-wide domain enumeration API. Enumerate every
    // Pages project (account-scoped, paginated), then list each project's
    // domains with bounded concurrency and flatten into the `read`
    // Attributes shape.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const projectNames = yield* pages.listProjects.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((project) => project.name))));
        const perProject = yield* Effect.forEach(projectNames, (projectName) => pages.listProjectDomains.pages({ accountId, projectName }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((domain) => toAttributes(domain, accountId, projectName)))), 
        // The project can vanish between enumeration and the
        // per-project list — skip it rather than failing the whole
        // enumeration.
        Effect.catchTag("ProjectNotFound", () => Effect.succeed([]))), { concurrency: 10 });
        return perProject.flat();
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const projectName = output?.projectName ??
            (typeof olds?.projectName === "string" ? olds.projectName : undefined);
        const name = output?.name ?? olds?.name;
        if (projectName === undefined || name === undefined)
            return undefined;
        const observed = yield* getDomain(acct, projectName, name);
        if (!observed)
            return undefined;
        const attrs = toAttributes(observed, acct, projectName);
        // With persisted state the attachment is ours; on a cold read we
        // cannot prove ownership (domain attachments carry no markers), so
        // gate takeover behind the adopt policy.
        return output?.domainId ? attrs : Unowned(attrs);
    }),
    reconcile: Effect.fn(function* ({ news }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Inputs have been resolved to concrete strings by Plan.
        const projectName = news.projectName;
        // 1. Observe — `(projectName, name)` is the attachment's identity.
        let observed = yield* getDomain(accountId, projectName, news.name);
        // 2. Ensure — existence-only resource: attach when missing,
        //    tolerating the AlreadyExists race by re-reading.
        if (!observed) {
            observed = yield* pages
                .createProjectDomain({
                accountId,
                projectName,
                name: news.name,
            })
                .pipe(Effect.catchTag("PagesDomainAlreadyExists", (originalError) => Effect.gen(function* () {
                const existing = yield* getDomain(accountId, projectName, news.name);
                if (!existing)
                    return yield* Effect.fail(originalError);
                return existing;
            })));
        }
        else if (observed.status === "pending" || observed.status === "error") {
            // 3. Sync — nothing is mutable on the attachment itself, but a
            //    stalled validation can be re-kicked. Tolerate the domain
            //    vanishing between observe and patch.
            observed = yield* pages
                .patchProjectDomain({
                accountId,
                projectName,
                domainName: news.name,
            })
                .pipe(Effect.catchTag("PagesDomainNotFound", () => Effect.succeed(observed)));
        }
        // 4. Return fresh attributes.
        return toAttributes(observed, accountId, projectName);
    }),
    delete: Effect.fn(function* ({ output }) {
        // Idempotent: the domain may already be detached, or the whole
        // project may already be gone (deleting a project detaches its
        // domains) — both count as success.
        yield* pages
            .deleteProjectDomain({
            accountId: output.accountId,
            projectName: output.projectName,
            domainName: output.name,
        })
            .pipe(Effect.catchTag("PagesDomainNotFound", () => Effect.void), Effect.catchTag("ProjectNotFound", () => Effect.void));
    }),
});
/**
 * Read a domain attachment, mapping "gone" to `undefined` — either the
 * domain is not attached (`PagesDomainNotFound`, code 8000021) or the
 * whole project no longer exists (`ProjectNotFound`, code 8000007).
 */
const getDomain = (accountId, projectName, domainName) => pages.getProjectDomain({ accountId, projectName, domainName }).pipe(Effect.catchTag("PagesDomainNotFound", () => Effect.succeed(undefined)), Effect.catchTag("ProjectNotFound", () => Effect.succeed(undefined)));
const toAttributes = (domain, accountId, projectName) => ({
    domainId: domain.domainId,
    accountId,
    projectName,
    name: domain.name,
    status: domain.status,
    // While a domain is still `initializing`/`pending`, Cloudflare omits the
    // certificate authority, validation/verification blocks and (for an
    // off-account zone) the zone tag entirely — coalesce to "" so the
    // Attributes shape stays stable across the async activation lifecycle.
    certificateAuthority: domain.certificateAuthority ?? "",
    validationStatus: domain.validationData?.status ?? "",
    validationMethod: domain.validationData?.method ?? "",
    verificationStatus: domain.verificationData?.status ?? "",
    zoneTag: domain.zoneTag ?? "",
    createdOn: domain.createdOn,
});
//# sourceMappingURL=Domain.js.map