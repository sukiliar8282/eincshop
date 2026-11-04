/** Scopes enabled on Alchemy's public Cloudflare OAuth client. */
export declare const OAUTH_SCOPE_GROUPS: readonly [{
    readonly id: "developer-platform";
    readonly label: "Developer Platform";
    readonly scopes: readonly ["agent-memory.write", "browser-rendering.read", "browser-rendering.write", "cf-agents.read", "cf-agents.write", "cloud-connector.read", "cloud-connector.write", "cloudchamber.read", "cloudchamber.write", "constellation.read", "constellation.write", "d1.read", "d1.write", "flagship.evaluate", "flagship.read", "flagship.write", "query-cache.read", "query-cache.write", "mcp-portals.read", "mcp-portals.write", "messaging.edit", "messaging.read", "page.read", "page.write", "pipelines.read", "pipelines.send", "pipelines.write", "pubsub.read", "pubsub.write", "queues.read", "queues.write", "realtime.admin", "realtime.read", "realtime.write", "secrets-store.read", "secrets-store.write", "vectorize.read", "vectorize.write", "workers-ci.read", "workers-ci.write", "containers.read", "containers.write", "workers-scripts.edit", "workers-kv-storage.read", "workers-kv-storage.write", "workers-observability.read", "workers-observability-telemetry.write", "workers-observability.write", "r2-catalog.read", "r2-catalog.write", "r2-catalog-sql.read", "workers-r2-bucket-item.read", "workers-r2-bucket-item.write", "workers-r2.read", "workers-r2.write", "workers-routes.read", "workers-routes.write", "workers-scripts.bind", "workers-scripts.read", "workers-scripts.write", "workers-tail.read"];
}, {
    readonly id: "ai-machine-learning";
    readonly label: "AI & Machine Learning";
    readonly scopes: readonly ["aiaudit.read", "aiaudit.write", "aig.read", "aig.run", "aig.write", "ai-search.index", "ai-search.read", "ai-search.run", "ai-search.write", "agw.read", "agw.run", "agw.write", "rag.read", "rag.run", "rag.write", "firewall-for-ai.read", "firewall-for-ai.write", "websearch.read", "websearch.run", "websearch.write", "ai.read", "ai.write"];
}, {
    readonly id: "dns-zones";
    readonly label: "DNS & Zones";
    readonly scopes: readonly ["account-dns-settings.read", "account-dns-settings.write", "dns-firewall.read", "dns-firewall.write", "dns.read", "dns-view.read", "dns-view.write", "dns.write", "registrar-domains.admin", "registrar-domains.read", "registrar-sandbox-domains.admin", "registrar-sandbox-domains.read", "zone-custom-asset.read", "zone-custom-asset.write", "zone-dns-settings.read", "zone-dns-settings.write", "zone.read", "zone-settings.read", "zone-settings.write", "zone-versioning.read", "zone-versioning.write", "zone.write"];
}, {
    readonly id: "app-security";
    readonly label: "App Security";
    readonly scopes: readonly ["fraud-detection-pii.read", "account-firewall-access-rules.read", "account-firewall-access-rules.write", "account-security-center-insights.read", "account-security-center-insights.write", "account-waf.read", "account-waf.write", "request-tracer.read", "reports-application-security-report.read", "bot-management-feedback.read", "bot-management-feedback.write", "bot-management.read", "bot-management.write", "cloudforce-one.read", "cloudforce-one.write", "ddos-botnet-feed.read", "ddos-botnet-feed.write", "ddos-protection.read", "ddos-protection.write", "api-gateway.read", "api-gateway.write", "domain-page.shield", "domain-page-shield.read", "field-extractor.read", "field-extractor.write", "firewall-services.read", "firewall-services.write", "fraud-detection.read", "fraud-detection.write", "fraud-events.write", "fraud-feedback.read", "fraud-feedback.write", "http-applications.read", "http-applications.write", "http-ddos-managed-ruleset.read", "http-ddos-managed-ruleset.write", "iot.read", "iot.write", "l4-ddos-managed-ruleset.read", "l4-ddos-managed-ruleset.write", "page-rules.read", "page-rules.write", "page.shield", "page-shield.read", "precursor.read", "precursor.write", "sanitize.read", "sanitize.write", "tag.read", "tag.write", "trust-and-safety.read", "trust-and-safety.write", "challenge-widgets.read", "challenge-widgets.write", "url-scanner.read", "url-scanner.write", "zaraz.edit", "zaraz.read", "zaraz.write", "zone-security-center-insights.read", "zone-security-center-insights.write", "zone-waf.read", "zone-waf.write"];
}, {
    readonly id: "rules-configuration";
    readonly label: "Rules & Configuration";
    readonly scopes: readonly ["account-custom-error-rules.read", "account-custom-error-rules.write", "account-custom-pages.read", "account-custom-pages.write", "account-rule-lists.read", "account-rule-lists.write", "account-rulesets.read", "account-rulesets.write", "config-settings.read", "config-settings.write", "custom-errors.read", "custom-errors.write", "custom-pages.read", "custom-pages.write", "dynamic-redirect.read", "dynamic-redirect.write", "managed-headers.read", "managed-headers.write", "mass-url-redirects.read", "mass-url-redirects.write", "origin.read", "origin.write", "payments-gateway.read", "payments-gateway.write", "response-compression.read", "response-compression.write", "select-configuration.read", "select-configuration.write", "snippets.read", "snippets.write", "transform-rules.read", "transform-rules.write", "zone-transform-rules.read", "zone-transform-rules.write"];
}, {
    readonly id: "zero-trust";
    readonly label: "Cloudflare One / Zero Trust";
    readonly scopes: readonly ["access-app.read", "access-app.revoke", "access-app.write", "access.read", "zone-access.read", "access.revoke", "zone-access.revoke", "access.write", "zone-access.write", "access-audit-log.read", "access-custom-page.read", "access-custom-page.write", "access-device-posture.read", "access-device-posture.write", "access-group.read", "access-group.write", "access-idp.read", "access-idp.write", "access-key.read", "access-key.write", "access-certificate.read", "access-certificate.write", "access-org.read", "access-org.revoke", "access-org.write", "access-acct.read", "access-acct.revoke", "access-acct.write", "access-policy.read", "access-policy.write", "access-policy-test.read", "access-policy-test.write", "access-population.read", "access-population.write", "access-saml-certificate.read", "access-saml-certificate.write", "access-scim-log.read", "access-ssh-auditing.read", "access-ssh-auditing.write", "access-service-token.read", "access-service-token.write", "access-tag.read", "access-tag.write", "access-users.read", "access-users.write", "casb.read", "casb.write", "teams-cds-compute-account.read", "teams-cds-compute-account.write", "teams-dex.read", "teams-dex.write", "teams-connector-cloudflared.monitoring", "teams-connector-warp.read", "teams-connector-warp.write", "teams-connector-cloudflared.read", "teams-connector-cloudflared.write", "teams-connectors.read", "teams-connectors.write", "teams-networks.read", "teams-networks.write", "argotunnel.read", "argotunnel.write", "teams-secure.location", "dls.read", "dls.write", "teams.read", "teams.report", "teams-resilience.read", "teams-resilience.write", "teams.write", "teams-pii.read", "access-seats.write"];
}, {
    readonly id: "analytics-logs";
    readonly label: "Analytics & Logs";
    readonly scopes: readonly ["account-analytics.read", "analytics.read", "intel.read", "intel.write", "account-logs.read", "account-logs.write", "logs.read", "logs.write", "radar.read"];
}, {
    readonly id: "network-services";
    readonly label: "Network Services";
    readonly scopes: readonly ["account-waiting-rooms.read", "address-maps.read", "address-maps.write", "chinanetwork-steering.read", "chinanetwork-steering.write", "connectivity-directory.admin", "connectivity-directory.bind", "connectivity-directory.read", "healthcheck.read", "healthcheck.write", "ip-prefix-bgp-on-demand.read", "ip-prefix-bgp-on-demand.write", "ip-prefix.read", "ip-prefix.write", "load-balancers-account.read", "load-balancers-account.write", "load-balancers.read", "load-balancers.write", "load-balancing-monitors-and-pools.read", "load-balancing-monitors-and-pools.write", "pcaps-api.read", "pcaps-api.write", "magic-firewall.read", "magic-firewall.write", "fbm.admin", "fbm.read", "fbm.write", "magic-transit.read", "magic-transit.write", "magic-wan.read", "magic-wan.write", "waiting-rooms.read", "waiting-rooms.write", "web3-hostnames.read", "web3-hostnames.write"];
}, {
    readonly id: "media";
    readonly label: "Media";
    readonly scopes: readonly ["calls.read", "calls.write", "images.read", "images.write", "moq.read", "moq.write", "stream.read", "stream.write"];
}, {
    readonly id: "email-messaging";
    readonly label: "Email & Messaging";
    readonly scopes: readonly ["cloud-email-security.read", "cloud-email-security.write", "email-routing-account-rule.read", "email-routing-address.read", "email-routing-address.write", "email-routing-rule.read", "email-routing-rule.write", "email-routing-suppression.read", "email-routing-suppression.write", "email-security-dmarcreports.read", "email-security-dmarcreports.write", "email-sending.read", "email-sending.write"];
}, {
    readonly id: "cache-performance";
    readonly label: "Cache & Performance";
    readonly scopes: readonly ["account-ssl-and-certificates.read", "account-ssl-and-certificates.write", "cache.purge", "cache-settings.read", "cache-settings.write", "account-disable-esc.read", "account-disable-esc.write", "zone-disable-esc.read", "zone-disable-esc.write", "ssl-and-certificates.read", "ssl-and-certificates.write"];
}, {
    readonly id: "account-billing";
    readonly label: "Account & Billing";
    readonly scopes: readonly ["account-api-gateway.read", "account-api-gateway.write", "account-custom-asset.read", "account-custom-asset.write", "account-settings.read", "account-settings.write", "apps.write", "integration.write", "memberships.read", "memberships.write", "notifications.read", "notifications.write", "scim-provisioning.write", "user-details.read", "user-details.write"];
}, {
    readonly id: "other";
    readonly label: "Other";
    readonly scopes: readonly ["artifacts.read", "artifacts.write", "resource-library.read", "resource-library.write", "resource-sharing.read"];
}];
export type OAuthScopeId = (typeof OAUTH_SCOPE_GROUPS)[number]["scopes"][number];
/** Human-readable names from Cloudflare's OAuth scope catalog. */
export declare const OAUTH_SCOPE_NAMES: Readonly<Record<OAuthScopeId, string>>;
/** Flat lookup retained for consumers that do not need grouping metadata. */
export declare const ALL_SCOPES: Readonly<Record<OAuthScopeId, string>>;
/** Every scope available to the public Alchemy OAuth client. */
export declare const ALL_SCOPE_IDS: ReadonlyArray<OAuthScopeId>;
/**
 * Split stored scopes into those the current OAuth client offers and those
 * it does not. Profiles configured against an older client (or scope
 * catalog) can hold scopes the current client rejects, and a single unknown
 * scope invalidates the entire authorize URL — sanitize with this before
 * building one.
 */
export declare const partitionOAuthScopes: (scopes: ReadonlyArray<string>) => {
    valid: string[];
    dropped: string[];
};
/**
 * Initial selections for the custom-scope prompt. Reconfiguration restores
 * the existing OAuth grant while dropping scopes no longer offered by the
 * current client; first-time and stored-credential setup select every scope.
 */
export declare const customOAuthScopeDefaults: (currentConfig?: {
    readonly method: string;
    readonly scopes?: ReadonlyArray<string>;
    readonly [key: string]: unknown;
}) => string[];
/** Reusable scope bundles for common OAuth authorization flows. */
export declare const OAUTH_SCOPE_TEMPLATES: {
    readonly basic: readonly ["memberships.read", "user-details.read", "account-settings.read", "ai-search.run", "ai-search.write", "ai.write", "aig.read", "aig.run", "aig.write", "cloudchamber.write", "connectivity-directory.admin", "containers.write", "d1.write", "page.write", "pipelines.send", "pipelines.write", "queues.write", "secrets-store.write", "account-ssl-and-certificates.write", "ssl-and-certificates.write", "vectorize.write", "workers-kv-storage.write", "workers-observability.read", "workers-observability.write", "workers-observability-telemetry.write", "workers-r2.write", "workers-routes.write", "workers-scripts.write", "workers-tail.read", "zone.read"];
};
export declare const BASIC_SCOPES: ReadonlyArray<OAuthScopeId>;
//# sourceMappingURL=OAuthScopes.d.ts.map