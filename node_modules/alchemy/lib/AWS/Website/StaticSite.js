import * as Effect from "effect/Effect";
import { createHash } from "node:crypto";
import { AlchemyContext } from "../../AlchemyContext.js";
import * as Command from "../../Command/index.js";
import { toPath } from "../../FQN.js";
import * as Namespace from "../../Namespace.js";
import * as Output from "../../Output.js";
import { ProviderModePolicy } from "../../ProviderMode.js";
import { isResource } from "../../Resource.js";
import { Stack } from "../../Stack.js";
import { Stage } from "../../Stage.js";
import { Certificate } from "../ACM/Certificate.js";
import { CachePolicy } from "../CloudFront/CachePolicy.js";
import { Distribution } from "../CloudFront/Distribution.js";
import { Function as CloudFrontFunction } from "../CloudFront/Function.js";
import { Invalidation } from "../CloudFront/Invalidation.js";
import { KeyValueStore } from "../CloudFront/KeyValueStore.js";
import { KvEntries } from "../CloudFront/KvEntries.js";
import { KvRoutesUpdate } from "../CloudFront/KvRoutesUpdate.js";
import { MANAGED_ALL_VIEWER_EXCEPT_HOST_HEADER_POLICY_ID, MANAGED_CACHING_OPTIMIZED_POLICY_ID, } from "../CloudFront/ManagedPolicies.js";
import { OriginAccessControl } from "../CloudFront/OriginAccessControl.js";
import { Record as Route53Record } from "../Route53/Record.js";
import { Bucket } from "../S3/Bucket.js";
import { AssetDeployment } from "./AssetDeployment.js";
import { buildHostRedirectInjection, CF_ROUTER_INJECTION } from "./cfcode.js";
import { asRouterDomain, registerDevRouterRoute } from "./DevRouterRoute.js";
import { normalizeWebsiteDomain, } from "./shared.js";
/**
 * Deploy a static website to S3 and CloudFront using KV-based edge routing.
 *
 * `StaticSite` uploads site files to a private S3 bucket, creates a CloudFront
 * KeyValueStore with a file manifest for edge routing, and optionally builds
 * the site first. Supports standalone distribution or composition with
 * `AWS.Website.Router`.
 * ### Basic Sites
 * **Example:** Simple Static Site
 * ```typescript
 * const site = yield* StaticSite("Docs", {
 *   path: "./site",
 * });
 * ```
 *
 * ### Built Sites
 * **Example:** Build A Vite App
 * ```typescript
 * const site = yield* StaticSite("Web", {
 *   path: "./frontend",
 *   build: {
 *     command: "bun run build",
 *     output: "dist",
 *     env: {
 *       VITE_API_URL: api.url,
 *     },
 *   },
 * });
 * ```
 *
 * ### Single-Page Applications
 * **Example:** SPA With Client-Side Routing
 * ```typescript
 * // Misses fall back to index.html with a 200 so the client router
 * // can handle the path.
 * const site = yield* StaticSite("App", {
 *   path: "./app",
 *   build: {
 *     command: "bun run build",
 *     output: "dist",
 *   },
 *   spa: true,
 * });
 * ```
 *
 * ### Custom Domains
 * **Example:** Site With A Route 53 Domain
 * ```typescript
 * const site = yield* StaticSite("Web", {
 *   path: "./site",
 *   domain: {
 *     name: "www.example.com",
 *     hostedZoneId: zone.hostedZoneId,
 *   },
 *   errorPage: "404.html",
 * });
 * ```
 *
 * ### Router Composition
 * **Example:** Serve Through A Router
 * ```typescript
 * const site = yield* StaticSite("Docs", {
 *   path: "./docs",
 *   domain: {
 *     router,
 *     path: "/docs",
 *   },
 * });
 * ```
 *
 * **Example:** Host-Matched Router Attachment
 * ```typescript
 * // The site serves for docs.example.com on the router. On a same-stack
 * // router that owns a domain, this declaration alone provisions the
 * // hostname end-to-end: the site binds it onto the router's distribution
 * // (alias), certificate (SAN), and Route 53 record set. Wildcard
 * // patterns and cross-stack router refs register KV host-matching only —
 * // those hostnames must be covered by the router's own domain.
 * const site = yield* StaticSite("Docs", {
 *   path: "./docs",
 *   domain: {
 *     name: "docs.example.com",
 *     router,
 *   },
 * });
 * ```
 *
 * @resource
 */
export const StaticSite = (id, props) => Effect.gen(function* () {
    const ctx = yield* AlchemyContext;
    const remoted = yield* ProviderModePolicy;
    // Mirrors the Cloudflare Website composites: during `alchemy dev` with
    // a `dev.command`, the site is the external dev server (spawned in the
    // dev sidecar so it survives user-code HMR) and no cloud resources are
    // declared; `Alchemy.remote()` opts back into the full live deployment.
    const isLocal = ctx.dev && remoted !== true;
    if (isLocal && props.dev) {
        const dev = yield* Command.Dev("Dev", {
            command: props.dev.command,
            cwd: props.dev.cwd ??
                (typeof props.path === "string" ? props.path : undefined),
            env: props.dev.env,
        });
        const devUrl = Output.map(dev.url, (url) => url ?? props.dev?.url);
        // A Router-attached site registers with the Router in dev exactly as it
        // does live — same resource types, same ids, same route entries — with
        // the local dev server standing in for the S3 origin.
        const routerDomain = asRouterDomain(normalizeWebsiteDomain(props.domain));
        const kvNamespace = routerDomain
            ? yield* registerDevRouterRoute(routerDomain, devUrl)
            : undefined;
        return {
            bucket: undefined,
            build: undefined,
            files: undefined,
            distribution: undefined,
            invalidation: undefined,
            kvNamespace,
            url: devUrl,
            urls: [devUrl],
        };
    }
    return yield* makeKvSite(id, props);
}).pipe(Namespace.push(id));
/**
 * Shared implementation behind `StaticSite` and the SSR framework
 * composites (`AWS.Website.Nuxt`, ...): S3 + CloudFront + KV-manifest edge
 * routing, optionally with a dynamic server origin for misses.
 * @internal
 */
export const makeKvSite = Effect.fn("AWS.Website.KvSite")(function* (id, props, server) {
    const domain = normalizeWebsiteDomain(props.domain);
    const routerDomain = domain?.router
        ? domain
        : undefined;
    const standaloneDomain = domain && !domain.router
        ? domain
        : undefined;
    const sitePath = (props.path ?? ".");
    const indexPage = props.indexPage ?? "index.html";
    const assetPrefix = normalizePrefix(props.assets?.path);
    const assetRoutes = [...(props.assets?.routes ?? [])]
        .map((value) => value.trim())
        .filter(Boolean)
        .map(normalizeRoutePath);
    const invalidationProps = props.invalidation !== undefined
        ? props.invalidation
        : { paths: "all", wait: false };
    if (routerDomain && props.edge) {
        return yield* Effect.die(`Cannot provide both "edge" and "domain.router". Use the "edge" prop on the Router component.`);
    }
    if (routerDomain && props.cloudfrontUrl !== undefined) {
        return yield* Effect.die(`"cloudfrontUrl" does not apply to a Router-attached site ("domain.router" is set): the site owns no distribution. Set "cloudfrontUrl" on the Router instead.`);
    }
    if (props.cloudfrontUrl === false && !standaloneDomain) {
        return yield* Effect.die(`"cloudfrontUrl: false" requires a "domain" — without one the site would be unreachable (the CloudFront default domain is its only URL).`);
    }
    if (routerDomain?.aliases?.length && !routerDomain.name) {
        return yield* Effect.die(`"domain.aliases" requires "domain.name" on a Router-attached site.`);
    }
    if (routerDomain?.redirects?.length &&
        (!routerDomain.name || routerDomain.name.includes("*"))) {
        return yield* Effect.die(`"domain.redirects" requires a concrete (non-wildcard) "domain.name" to redirect to.`);
    }
    if (standaloneDomain?.redirects?.length &&
        standaloneDomain.name.includes("*")) {
        return yield* Effect.die(`"domain.redirects" requires a concrete (non-wildcard) "domain.name" to redirect to.`);
    }
    if (props.spa && props.errorPage) {
        return yield* Effect.die(`Cannot provide both "spa" and "errorPage". A SPA answers misses with the index page (200); "errorPage" answers them with a real 404.`);
    }
    if (server && (props.spa || props.errorPage)) {
        return yield* Effect.die(`A site with a server origin routes misses to the server; "spa" and "errorPage" do not apply.`);
    }
    const build = props.build
        ? yield* Command.Build("Build", {
            command: props.build.command,
            cwd: sitePath,
            memo: {
                include: props.build.include,
                exclude: props.build.exclude,
                lockfile: props.build.lockfile,
            },
            outdir: props.build.output,
            env: props.build.env,
        })
        : undefined;
    const uploadSourcePath = (build?.outdir ?? sitePath);
    const providedBucket = props.assets?.bucket;
    const bucket = providedBucket ??
        (yield* Bucket("Bucket", {
            bucketName: props.bucketName,
            forceDestroy: props.forceDestroy,
            tags: props.tags,
        }));
    const routerPathPrefix = routerDomain?.path
        ? "/" + routerDomain.path.replace(/^\//, "").replace(/\/$/, "")
        : undefined;
    const files = yield* AssetDeployment("Files", {
        bucket: bucket,
        sourcePath: uploadSourcePath,
        prefix: normalizeUploadPrefix(assetPrefix, routerPathPrefix),
        purge: props.assets?.purge ?? true,
        fileOptions: props.assets?.fileOptions,
        textEncoding: props.assets?.textEncoding,
    });
    const stack = yield* Stack;
    const stage = yield* Stage;
    const ns = yield* Namespace.CurrentNamespace;
    const fqn = ns ? toPath(ns).join("/") : id;
    const kvNamespace = createHash("md5")
        .update(`${stack.name}-${stage}-${fqn}`)
        .digest("hex")
        .substring(0, 4);
    // Standalone distributions carry the asset prefix as the default
    // origin's `originPath` (so error-page fetches that bypass the edge
    // function still resolve); router-attached sites prefix at the edge via
    // the KV metadata instead.
    const s3MetadataDir = routerDomain && assetPrefix ? "/" + assetPrefix : "";
    const kvEntries = buildKvEntries({
        files,
        bucketDomain: bucket.bucketRegionalDomainName,
        s3Dir: s3MetadataDir,
        assetRoutes,
        indexPage,
        errorPage: props.errorPage,
        routerPathPrefix,
        redirect: routerDomain?.redirects?.length && routerDomain.name
            ? { hosts: routerDomain.redirects, to: routerDomain.name }
            : undefined,
        serverHost: server?.serverHost,
        imageRoute: server?.image?.route,
        imageHost: server?.image?.host,
    });
    let distributionId;
    let kvStoreArn;
    let distribution;
    let urls;
    if (routerDomain) {
        const routerRef = routerDomain.router;
        kvStoreArn = routerRef.kvStoreArn;
        distributionId = routerRef.distributionId;
        // One KV route entry per host pattern: the canonical name (or the
        // match-any-host "" pattern), each alias, and each redirect hostname
        // (so redirected requests still match this site's route — the edge
        // function then 301s them from the site's KV metadata).
        const hostPatterns = [
            ["RoutesUpdate", routerDomain.name],
            ...(routerDomain.aliases ?? []).map((alias, index) => [
                `RoutesUpdateAlias${index + 1}`,
                alias,
            ]),
            ...(routerDomain.redirects ?? []).map((redirect, index) => [
                `RoutesUpdateRedirect${index + 1}`,
                redirect,
            ]),
        ];
        yield* Effect.forEach(hostPatterns, ([routeId, pattern]) => KvRoutesUpdate(routeId, {
            store: kvStoreArn,
            namespace: routerRef.kvNamespace,
            key: "routes",
            entry: [
                "site",
                kvNamespace,
                pattern ? toHostPatternRegex(pattern) : "",
                routerPathPrefix ?? "/",
            ].join(","),
        }), { concurrency: "unbounded" });
        // Site→Router hostname binding: this site's concrete hostnames are
        // bound onto the Router's distribution (alias), managed certificate
        // (SAN — a change replaces the certificate create-first), and Route 53
        // record set, so the declaration here alone fully provisions the
        // hostname. Wildcard patterns bind nothing concrete, and cross-stack
        // Router refs carry no `bindTargets` (bindings are same-stack) — in
        // both cases the site registers KV host-matching only and the
        // hostname must be covered by the Router's own `domain`.
        const concreteHostnames = [
            ...(routerDomain.name && !routerDomain.name.includes("*")
                ? [routerDomain.name]
                : []),
            ...(routerDomain.aliases ?? []).filter((alias) => !alias.includes("*")),
            ...(routerDomain.redirects ?? []),
        ];
        const bindTargets = routerRef.bindTargets;
        if (bindTargets && concreteHostnames.length > 0) {
            if (bindTargets.distribution && isResource(bindTargets.distribution)) {
                yield* bindTargets.distribution.bind `AWS.Website.Site(${fqn})`({
                    aliases: concreteHostnames,
                });
            }
            if (bindTargets.certificate && isResource(bindTargets.certificate)) {
                yield* bindTargets.certificate.bind `AWS.Website.Site(${fqn})`({
                    subjectAlternativeNames: concreteHostnames,
                });
            }
            if (bindTargets.records && isResource(bindTargets.records)) {
                yield* bindTargets.records.bind `AWS.Website.Site(${fqn})`({
                    names: concreteHostnames,
                });
            }
        }
        // Host-matched attachment: the site's own hostnames (the router's
        // CloudFront URL never serves it — KV host-match). Path-only
        // attachment: derived from the router's primary URL, inheriting the
        // router's precedence (including its `cloudfrontUrl` choice).
        urls = routerDomain.name
            ? [
                `https://${routerDomain.name}${routerPathPrefix ?? ""}`,
                ...(routerDomain.aliases ?? []).map((alias) => `https://${alias}${routerPathPrefix ?? ""}`),
            ]
            : [Output.interpolate `${routerRef.url}${routerPathPrefix ?? ""}`];
    }
    else {
        const domain = standaloneDomain;
        if (domain &&
            !domain.cert &&
            !domain.hostedZoneId &&
            domain.dns === false) {
            return yield* Effect.die("StaticSite domain configuration with `dns: false` requires `cert`.");
        }
        const certificate = !domain || domain.cert
            ? domain?.cert
                ? { certificateArn: domain.cert }
                : undefined
            : yield* Certificate("Certificate", {
                domainName: domain.name,
                subjectAlternativeNames: [
                    ...(domain.aliases ?? []),
                    ...(domain.redirects ?? []),
                ],
                hostedZoneId: domain.hostedZoneId,
                tags: props.tags,
            });
        const kvStore = yield* KeyValueStore("KvStore", {});
        kvStoreArn = kvStore.keyValueStoreArn;
        const viewerRequest = yield* CloudFrontFunction("ViewerRequest", {
            comment: `${id} viewer request`,
            code: buildRequestFunctionCode({
                kvNamespace,
                userInjection: props.edge?.viewerRequest?.injection,
                hostRedirect: domain
                    ? {
                        to: domain.name,
                        hosts: domain.redirects ?? [],
                        cloudfrontDefault: props.cloudfrontUrl === false,
                    }
                    : undefined,
            }),
            keyValueStoreArns: [kvStore.keyValueStoreArn],
        });
        const viewerResponse = props.edge?.viewerResponse
            ? yield* CloudFrontFunction("ViewerResponse", {
                comment: `${id} viewer response`,
                code: buildResponseFunctionCode(props.edge.viewerResponse.injection),
                keyValueStoreArns: props.edge.viewerResponse.keyValueStoreArn
                    ? [props.edge.viewerResponse.keyValueStoreArn]
                    : undefined,
            })
            : undefined;
        const functionAssociations = [
            {
                eventType: "viewer-request",
                functionArn: viewerRequest.functionArn,
            },
            ...(viewerResponse
                ? [
                    {
                        eventType: "viewer-response",
                        functionArn: viewerResponse.functionArn,
                    },
                ]
                : []),
        ];
        const errorPage = "/" + (props.errorPage ?? indexPage).replace(/^\//, "");
        const customErrorResponses = props.errorPage && !server
            ? [
                {
                    ErrorCode: 403,
                    ResponseCode: "404",
                    ResponsePagePath: errorPage,
                    ErrorCachingMinTTL: 0,
                },
                {
                    ErrorCode: 404,
                    ResponseCode: "404",
                    ResponsePagePath: errorPage,
                    ErrorCachingMinTTL: 0,
                },
            ]
            : undefined;
        // Server-backed sites share one behavior between S3 assets and the
        // dynamic origin, so the cache policy must not cache responses that
        // carry no Cache-Control (SSR pages) while still honoring the
        // immutable Cache-Control the asset uploader sets. Managed
        // CachingOptimized would cache header-less SSR responses for a day.
        const serverCachePolicy = server
            ? yield* CachePolicy("ServerCachePolicy", {
                comment: `${id} server cache policy`,
                minTTL: 0,
                defaultTTL: 0,
                maxTTL: "365 days",
                parametersInCacheKeyAndForwardedToOrigin: {
                    EnableAcceptEncodingGzip: true,
                    EnableAcceptEncodingBrotli: true,
                    QueryStringsConfig: { QueryStringBehavior: "all" },
                    HeadersConfig: { HeaderBehavior: "none" },
                    CookiesConfig: { CookieBehavior: "none" },
                },
            })
            : undefined;
        // The default origin is real (not a placeholder): static sites point
        // at the bucket through an OAC so requests that bypass the edge
        // function's origin switch — CloudFront's custom-error-page fetches
        // in particular — still resolve; server-backed sites point at the
        // server so misses stream from it even if the function is bypassed.
        const oac = server
            ? undefined
            : yield* OriginAccessControl("OriginAccessControl", {
                originType: "s3",
                description: `${id} origin access control`,
            });
        distribution = yield* Distribution("Distribution", {
            aliases: domain
                ? [domain.name, ...(domain.aliases ?? []), ...(domain.redirects ?? [])]
                : undefined,
            origins: [
                server
                    ? {
                        id: "default",
                        domainName: server.serverHost,
                        customOriginConfig: {
                            httpPort: 80,
                            httpsPort: 443,
                            originProtocolPolicy: "https-only",
                            originReadTimeout: "20 seconds",
                            originSslProtocols: ["TLSv1.2"],
                        },
                    }
                    : {
                        id: "default",
                        domainName: bucket.bucketRegionalDomainName,
                        s3Origin: true,
                        originAccessControlId: oac.originAccessControlId,
                        originPath: assetPrefix ? "/" + assetPrefix : undefined,
                    },
            ],
            defaultCacheBehavior: {
                targetOriginId: "default",
                viewerProtocolPolicy: "redirect-to-https",
                allowedMethods: [
                    "DELETE",
                    "GET",
                    "HEAD",
                    "OPTIONS",
                    "PATCH",
                    "POST",
                    "PUT",
                ],
                cachedMethods: ["GET", "HEAD"],
                compress: true,
                cachePolicyId: serverCachePolicy
                    ? serverCachePolicy.cachePolicyId
                    : MANAGED_CACHING_OPTIMIZED_POLICY_ID,
                originRequestPolicyId: server
                    ? MANAGED_ALL_VIEWER_EXCEPT_HOST_HEADER_POLICY_ID
                    : undefined,
                functionAssociations,
            },
            customErrorResponses,
            viewerCertificate: certificate
                ? {
                    acmCertificateArn: certificate.certificateArn,
                    sslSupportMethod: "sni-only",
                    minimumProtocolVersion: "TLSv1.2_2021",
                }
                : undefined,
            tags: props.tags,
        });
        const dist = distribution;
        distributionId = dist.distributionId;
        if (domain && domain.dns !== false) {
            yield* Effect.forEach([domain.name, ...(domain.aliases ?? []), ...(domain.redirects ?? [])], (name, index) => Route53Record(`AliasRecord${index + 1}`, {
                // Optional — the Record provider infers the most specific
                // public zone containing `name` when omitted.
                hostedZoneId: domain.hostedZoneId,
                name,
                type: "A",
                aliasTarget: {
                    hostedZoneId: dist.hostedZoneId,
                    dnsName: dist.domainName,
                },
            }), { concurrency: "unbounded" });
        }
        // Precedence: the canonical domain, then aliases in declaration
        // order, then the CloudFront default domain (only while
        // `cloudfrontUrl` is enabled). Redirect hostnames never appear.
        //
        // `dist.url` rather than an interpolated
        // `https://${dist.domainName}` (same as Router): the distribution
        // knows its own address, which is `https://{id}.cloudfront.net` on
        // AWS and `http://localhost:{port}` under `alchemy dev`, where that
        // AWS hostname resolves to nothing.
        urls = domain
            ? [
                Output.interpolate `https://${domain.name}`,
                ...(domain.aliases ?? []).map((alias) => `https://${alias}`),
                ...(props.cloudfrontUrl !== false ? [dist.url] : []),
            ]
            : [dist.url];
    }
    // The edge router signs S3 origin requests with OAC (sigv4, see
    // `setS3Origin` in cfcode.ts), so the bucket must allow the serving
    // distribution — without this policy every request 403s.
    const servingDistributionArn = routerDomain
        ? routerDomain.router.distributionArn
        : distribution.distributionArn;
    const bucketPolicy = {
        Effect: "Allow",
        Principal: {
            Service: "cloudfront.amazonaws.com",
        },
        Action: ["s3:GetObject"],
        Resource: [Output.interpolate `${bucket.bucketArn}/*`],
        Condition: {
            StringEquals: {
                "AWS:SourceArn": servingDistributionArn,
            },
        },
    };
    yield* bucket.bind `AWS.S3.Policy(CloudFront, ${bucket})`({
        policyStatements: [bucketPolicy],
    });
    yield* KvEntries("KvEntries", {
        store: kvStoreArn,
        namespace: kvNamespace,
        entries: kvEntries,
        purge: props.assets?.purge ?? true,
    });
    const invalidation = invalidationProps === false
        ? undefined
        : yield* Invalidation("Invalidation", {
            distributionId: distributionId,
            version: files.version,
            wait: invalidationProps?.wait,
            paths: invalidationProps?.paths === "all" || !invalidationProps?.paths
                ? ["/*"]
                : invalidationProps.paths === "versioned"
                    ? [`/${indexPage.replace(/^\/+/, "")}`]
                    : invalidationProps.paths,
        });
    return {
        bucket: bucket,
        build,
        files,
        distribution,
        invalidation,
        kvNamespace,
        /**
         * The most significant URL the site serves at — always `urls[0]`.
         */
        url: urls[0],
        /**
         * Every URL that serves this site, most significant first —
         * `[https://<domain.name>?, ...aliases, <CloudFront default domain>?]`
         * (the default domain only while `cloudfrontUrl` is enabled).
         * Router-attached sites list their own hostnames (host-matched) or
         * the router's URL plus `domain.path` (path-only). Redirect
         * hostnames never appear — they serve no content.
         */
        urls,
    };
});
/**
 * Derive the CloudFront KV routing entries from the *uploaded* file list
 * (the `AssetDeployment`'s `files` attribute) so the manifest always
 * reflects exactly what landed in S3 — including build outputs that do not
 * exist at plan time.
 */
const buildKvEntries = (args) => Output.map(([fileList, bucketDomain, serverHost, imageHost]) => {
    const entries = {};
    for (const file of fileList ?? []) {
        entries[`/${file}`] = "s3";
    }
    const errorPagePath = "/" + (args.errorPage ?? args.indexPage).replace(/^\//, "");
    const metadata = {
        base: args.routerPathPrefix && args.routerPathPrefix !== "/"
            ? args.routerPathPrefix
            : undefined,
        custom404: serverHost !== undefined || args.errorPage
            ? undefined
            : errorPagePath,
        errorResponseCode: serverHost === undefined && args.errorPage ? 404 : undefined,
        s3: {
            domain: bucketDomain,
            dir: args.s3Dir,
            routes: args.assetRoutes,
        },
        servers: serverHost !== undefined ? [[serverHost]] : undefined,
        image: args.imageRoute !== undefined && imageHost !== undefined
            ? { route: args.imageRoute, host: imageHost }
            : undefined,
        redirect: args.redirect,
    };
    entries["metadata"] = JSON.stringify(metadata);
    return entries;
})(Output.all(args.files.files, Output.asOutput(args.bucketDomain), Output.asOutput(args.serverHost), Output.asOutput(args.imageHost)));
const buildRequestFunctionCode = ({ kvNamespace, userInjection, hostRedirect, }) => `import cf from "cloudfront";
async function handler(event) {
  ${userInjection ?? ""}
  ${hostRedirect
    ? buildHostRedirectInjection({
        to: hostRedirect.to,
        hosts: hostRedirect.hosts,
        cloudfrontDefault: hostRedirect.cloudfrontDefault,
    })
    : ""}
  ${CF_ROUTER_INJECTION}

  const kvNamespace = "${kvNamespace}";

  let metadata;
  try {
    const v = await cf.kvs().get(kvNamespace + ":metadata");
    metadata = JSON.parse(v);
  } catch (e) {}

  const response = await routeSite(kvNamespace, metadata);
  return response || event.request;
}`;
const buildResponseFunctionCode = (userInjection) => `import cf from "cloudfront";
async function handler(event) {
  ${userInjection ?? ""}
  return event.response;
}`;
const normalizePrefix = (prefix) => prefix ? prefix.replace(/^\/+|\/+$/g, "") : "";
const normalizeUploadPrefix = (assetPrefix, routerPathPrefix) => {
    const parts = [assetPrefix, routerPathPrefix?.replace(/^\//, "")].filter(Boolean);
    return parts.join("/") || "";
};
const normalizeRoutePath = (value) => `/${value.replace(/^\/+|\/+$/g, "")}`;
/**
 * Convert a host pattern (`docs.example.com`, `*.example.com`) into the
 * escaped regex fragment stored in the Router's KV route table (matched by
 * the router's edge function).
 */
const toHostPatternRegex = (pattern) => pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
//# sourceMappingURL=StaticSite.js.map