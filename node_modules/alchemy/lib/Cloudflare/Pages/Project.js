import * as pages from "@distilled.cloud/cloudflare/pages";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { arrayEqualsUnordered } from "../../Util/equal.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Pages.Project";
/**
 * A Cloudflare Pages project (direct-upload).
 *
 * The project is the container for Pages deployments, custom domains, and
 * per-environment configuration. Created without git `source` integration,
 * it is a direct-upload project — deployments are pushed via the API or
 * `wrangler pages deploy`.
 *
 * The project `name` is its identity (it forms the `<name>.pages.dev`
 * subdomain), so renaming triggers a replacement. `productionBranch`,
 * `buildConfig`, and `deploymentConfigs` are all mutable in place.
 * ### Creating a Project
 * **Example:** Minimal project (generated name)
 * ```typescript
 * const project = yield* Cloudflare.Pages.Project("site", {});
 * // project.subdomain === "<generated-name>.pages.dev"
 * ```
 *
 * **Example:** Named project with a build config
 * ```typescript
 * const project = yield* Cloudflare.Pages.Project("site", {
 *   name: "my-site",
 *   productionBranch: "main",
 *   buildConfig: {
 *     buildCommand: "npm run build",
 *     destinationDir: "dist",
 *   },
 * });
 * ```
 *
 * ### Deployment Configuration
 * **Example:** Environment variables and bindings
 * ```typescript
 * const project = yield* Cloudflare.Pages.Project("site", {
 *   deploymentConfigs: {
 *     production: {
 *       compatibilityDate: "2026-08-31",
 *       envVars: {
 *         API_URL: { value: "https://api.example.com" },
 *         API_KEY: { type: "secret_text", value: apiKey },
 *       },
 *       kvNamespaces: {
 *         CACHE: kvNamespace.namespaceId,
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * ### Custom Domains
 * **Example:** Attach a custom domain
 * ```typescript
 * const domain = yield* Cloudflare.Pages.Domain("site-domain", {
 *   projectName: project.name,
 *   name: "www.example.com",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/pages/
 *
 * @resource
 * @product Pages
 * @category Workers & Compute
 */
export const Project = Resource(TypeId);
/**
 * Returns true if the given value is a Project resource.
 */
export const isProject = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const ProjectProvider = () => Provider.succeed(Project, {
    stables: ["projectId", "accountId", "name", "subdomain", "createdOn"],
    diff: Effect.fn(function* ({ id, olds, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // The name is the project's identity (it forms the *.pages.dev
        // subdomain) — renames are a delete + create.
        const oldName = output?.name ?? (yield* createProjectName(id, olds?.name));
        // Auto-generated names are engine-owned: the deployed name stays
        // authoritative even if the generator would name this id differently
        // today. Only an explicit user-provided name can force a replace.
        const name = news.name ?? oldName;
        if (name !== oldName) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.name) {
            const observed = yield* getProject(acct, output.name);
            return observed ? toAttributes(observed, acct) : undefined;
        }
        // Cold read — the project name is deterministic, so look it up
        // directly. Pages projects carry no ownership markers we can
        // inspect, so an existing match is reported as Unowned and takeover
        // is gated behind the adopt policy.
        const name = yield* createProjectName(id, olds?.name);
        const observed = yield* getProject(acct, name);
        return observed ? Unowned(toAttributes(observed, acct)) : undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = news.name ?? output?.name ?? (yield* createProjectName(id));
        // 1. Observe — the project name is its identity; a 404 falls
        //    through to "missing" and we (re)create.
        let observed = yield* getProject(accountId, name);
        // 2. Ensure — create when missing, tolerating the AlreadyExists
        //    race by re-reading.
        if (!observed) {
            observed = yield* pages
                .createProject({
                accountId,
                name,
                productionBranch: news.productionBranch ?? "main",
                buildConfig: toApiBuildConfig(news.buildConfig),
                deploymentConfigs: toApiDeploymentConfigs(news.deploymentConfigs, undefined),
            })
                .pipe(Effect.catchTag("ProjectAlreadyExists", (originalError) => Effect.gen(function* () {
                const existing = yield* getProject(accountId, name);
                if (!existing)
                    return yield* Effect.fail(originalError);
                return existing;
            })));
        }
        // 3. Sync — diff observed cloud state against the desired props and
        //    PATCH only the delta. Cloudflare's PATCH deep-merges
        //    `deploymentConfigs`, so removed record keys are sent as
        //    explicit nulls.
        const patch = buildProjectPatch(news, observed);
        if (patch !== undefined) {
            observed = yield* pages.patchProject({
                accountId,
                projectName: name,
                ...patch,
            });
        }
        // 4. Return fresh attributes.
        return toAttributes(observed, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        // Deleting a project deletes its deployments and detaches custom
        // domains. A missing project is success — delete is idempotent.
        yield* pages
            .deleteProject({
            accountId: output.accountId,
            projectName: output.name,
        })
            .pipe(Effect.catchTag("ProjectNotFound", () => Effect.void));
    }),
    // Pages projects are account-scoped; enumerate every project in the
    // account, paginating exhaustively, and hydrate each into the same
    // Attributes shape `read` returns.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* pages.listProjects.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((project) => ({
            projectId: project.id,
            accountId,
            name: project.name,
            subdomain: project.subdomain ?? `${project.name}.pages.dev`,
            domains: [...(project.domains ?? [])],
            productionBranch: project.productionBranch,
            createdOn: project.createdOn,
        })))));
    }),
});
/**
 * Read a project by name, mapping "gone" (`ProjectNotFound`, Cloudflare
 * error code 8000007) to `undefined`.
 */
const getProject = (accountId, projectName) => pages
    .getProject({ accountId, projectName })
    .pipe(Effect.catchTag("ProjectNotFound", () => Effect.succeed(undefined)));
/**
 * Pages project names form the `<name>.pages.dev` subdomain: lowercase
 * alphanumerics and dashes, at most 58 characters.
 */
const createProjectName = (id, name) => Effect.gen(function* () {
    return (name ??
        (yield* createPhysicalName({ id, lowercase: true, maxLength: 58 })));
});
const toAttributes = (project, accountId) => ({
    projectId: project.id,
    accountId,
    name: project.name,
    subdomain: project.subdomain ?? `${project.name}.pages.dev`,
    domains: [...(project.domains ?? [])],
    productionBranch: project.productionBranch,
    createdOn: project.createdOn,
});
const toApiBuildConfig = (config) => config === undefined
    ? undefined
    : {
        buildCaching: config.buildCaching,
        buildCommand: config.buildCommand,
        destinationDir: config.destinationDir,
        rootDir: config.rootDir,
    };
/**
 * Map the desired deployment config of one environment to the API shape.
 * When `observed` is provided, record-shaped fields include explicit
 * `null`s for observed keys absent from the desired config — Cloudflare's
 * PATCH endpoint deep-merges, so this is how keys are removed.
 */
const toApiEnvConfig = (desired, observed) => ({
    envVars: mergeRecord(desired.envVars === undefined
        ? undefined
        : Object.fromEntries(Object.entries(desired.envVars).map(([key, envVar]) => [
            key,
            {
                type: envVar.type ?? "plain_text",
                value: envVar.value,
            },
        ])), observed?.envVars),
    kvNamespaces: mergeRecord(mapBindingRecord(desired.kvNamespaces, "namespace_id"), observed?.kvNamespaces),
    d1Databases: mergeRecord(mapBindingRecord(desired.d1Databases, "id"), observed?.d1Databases),
    r2Buckets: mergeRecord(mapBindingRecord(desired.r2Buckets, "name"), observed?.r2Buckets),
    compatibilityDate: desired.compatibilityDate,
    compatibilityFlags: desired.compatibilityFlags,
    failOpen: desired.failOpen,
    placement: desired.placement,
});
const mapBindingRecord = (record, idKey) => record === undefined
    ? undefined
    : Object.fromEntries(Object.entries(record).map(([binding, id]) => [
        binding,
        { [idKey]: id },
    ]));
/**
 * Overlay the desired record on top of the observed one, nulling observed
 * keys that are absent from the desired record so PATCH removes them.
 * `undefined` desired means "unmanaged" — leave the cloud state alone.
 */
const mergeRecord = (desired, observed) => {
    if (desired === undefined)
        return undefined;
    const removals = Object.fromEntries(Object.keys(observed ?? {})
        .filter((key) => !(key in desired))
        .map((key) => [key, null]));
    return { ...removals, ...desired };
};
const toApiDeploymentConfigs = (desired, observed) => {
    if (desired === undefined)
        return undefined;
    const configs = {};
    if (desired.preview !== undefined) {
        configs.preview = toApiEnvConfig(desired.preview, observed?.preview);
    }
    if (desired.production !== undefined) {
        configs.production = toApiEnvConfig(desired.production, observed?.production);
    }
    return configs;
};
/**
 * Compute the PATCH body needed to converge the observed project to the
 * desired props, or `undefined` when the project is already converged.
 * Props left `undefined` are unmanaged and never touched.
 */
const buildProjectPatch = (news, observed) => {
    const patch = {};
    let dirty = false;
    const desiredBranch = news.productionBranch ?? "main";
    if (observed.productionBranch !== desiredBranch) {
        patch.productionBranch = desiredBranch;
        dirty = true;
    }
    if (news.buildConfig !== undefined &&
        buildConfigDirty(news.buildConfig, observed.buildConfig)) {
        patch.buildConfig = toApiBuildConfig(news.buildConfig);
        dirty = true;
    }
    if (news.deploymentConfigs !== undefined) {
        const desired = toApiDeploymentConfigs(news.deploymentConfigs, observedDeploymentConfigs(observed));
        if (desired !== undefined &&
            deploymentConfigsDirty(desired, observedDeploymentConfigs(observed))) {
            patch.deploymentConfigs = desired;
            dirty = true;
        }
    }
    return dirty ? patch : undefined;
};
const observedDeploymentConfigs = (observed) => observed.deploymentConfigs;
const buildConfigDirty = (desired, observed) => {
    const fields = [
        "buildCaching",
        "buildCommand",
        "destinationDir",
        "rootDir",
    ];
    return fields.some((field) => desired[field] !== undefined &&
        desired[field] !== (observed?.[field] ?? undefined));
};
const deploymentConfigsDirty = (desired, observed) => (desired.preview !== undefined &&
    envConfigDirty(desired.preview, observed?.preview)) ||
    (desired.production !== undefined &&
        envConfigDirty(desired.production, observed?.production));
const envConfigDirty = (desired, observed) => {
    if (desired.compatibilityDate !== undefined &&
        desired.compatibilityDate !== observed?.compatibilityDate) {
        return true;
    }
    if (desired.compatibilityFlags !== undefined &&
        !arrayEqualsUnordered(desired.compatibilityFlags, observed?.compatibilityFlags ?? [])) {
        return true;
    }
    if (desired.failOpen !== undefined &&
        desired.failOpen !== observed?.failOpen) {
        return true;
    }
    if (desired.placement !== undefined &&
        desired.placement.mode !== observed?.placement?.mode) {
        return true;
    }
    return (recordDirty(desired.envVars, observed?.envVars, envVarEquals) ||
        recordDirty(desired.kvNamespaces, observed?.kvNamespaces, deepEquals) ||
        recordDirty(desired.d1Databases, observed?.d1Databases, deepEquals) ||
        recordDirty(desired.r2Buckets, observed?.r2Buckets, deepEquals));
};
/**
 * A merged desired record (which already contains `null` removal markers)
 * is dirty when any non-null entry differs from the observed value or any
 * null marker still has an observed value to remove.
 */
const recordDirty = (desired, observed, equals) => {
    if (desired === undefined)
        return false;
    return Object.entries(desired).some(([key, value]) => value === null
        ? observed?.[key] !== undefined && observed[key] !== null
        : !equals(value, observed?.[key]));
};
/**
 * Secrets read back as `{ type: "secret_text" }` without a value, so a
 * desired secret with a value can never be proven converged — treat
 * matching-type secrets as equal and rely on PATCH idempotency.
 */
const envVarEquals = (desired, observed) => {
    const d = desired;
    const o = observed;
    if (o === undefined)
        return false;
    if (d.type === "secret_text")
        return o.type === "secret_text";
    return ((o.type ?? "plain_text") === (d.type ?? "plain_text") && o.value === d.value);
};
const deepEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
//# sourceMappingURL=Project.js.map