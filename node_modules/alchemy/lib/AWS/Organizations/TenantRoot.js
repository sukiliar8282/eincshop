import * as organizations from "@distilled.cloud/aws/organizations";
import * as Effect from "effect/Effect";
import * as IdentityCenter from "../IdentityCenter/index.js";
import { Account as OrganizationAccount } from "./Account.js";
import { DelegatedAdministrator as OrganizationsDelegatedAdministrator } from "./DelegatedAdministrator.js";
import { Organization as AwsOrganization } from "./Organization.js";
import { OrganizationalUnit as AwsOrganizationalUnit } from "./OrganizationalUnit.js";
import { Policy as OrganizationsPolicy } from "./Policy.js";
import { PolicyAttachment as OrganizationsPolicyAttachment } from "./PolicyAttachment.js";
import { Root as OrganizationRoot } from "./Root.js";
import { RootPolicyType as OrganizationsRootPolicyType } from "./RootPolicyType.js";
import { TrustedServiceAccess as OrganizationsTrustedServiceAccess } from "./TrustedServiceAccess.js";
const defaultTenantOrganizationalUnits = () => [
    {
        key: "security",
        name: "security",
        accounts: [
            {
                key: "security",
                name: "security",
                email: "security@example.com",
            },
            {
                key: "log-archive",
                name: "log-archive",
                email: "log-archive@example.com",
            },
        ],
    },
    {
        key: "infrastructure",
        name: "infrastructure",
        accounts: [
            {
                key: "shared-services",
                name: "shared-services",
                email: "shared-services@example.com",
            },
        ],
    },
    {
        key: "workloads",
        name: "workloads",
        accounts: [
            {
                key: "prod",
                name: "prod",
                email: "prod@example.com",
            },
        ],
    },
];
const toLogicalIdSegment = (value) => value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
/**
 * Compose an opinionated single-tenant landing zone inside the current AWS
 * Organizations management account.
 *
 * This helper intentionally stays aligned to native AWS semantics:
 * one real Organization, one root, nested OUs, and accounts beneath that
 * tenant root. The broader `RootRoot` concept is an Alchemy control-plane
 * abstraction over many such tenant roots deployed into separate management
 * accounts, not a nested AWS Organizations feature.
 * ### Creating A Tenant Root
 * **Example:** Tenant With Baseline Accounts
 * ```typescript
 * const tenant = yield* TenantRoot("CustomerA", {
 *   identityCenter: {
 *     mode: "existing",
 *     groups: [
 *       { key: "platform", displayName: "platform-engineers" },
 *     ],
 *     permissionSets: [
 *       {
 *         key: "admin",
 *         name: "AdministratorAccess",
 *         sessionDuration: "8 hours",
 *       },
 *     ],
 *     assignments: [
 *       {
 *         permissionSetKey: "admin",
 *         groupKey: "platform",
 *         accountKey: "prod",
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export const TenantRoot = Effect.fn(function* (id, props = {}) {
    const sharedTags = props.tags ?? {};
    const organization = yield* AwsOrganization(`${id}Organization`, {
        featureSet: "ALL",
        ...props.organization,
    });
    const root = yield* OrganizationRoot(`${id}Root`, {
        ...props.root,
        tags: mergeTags(sharedTags, props.root?.tags),
    });
    const policyTypes = yield* Effect.forEach(props.policyTypes ?? ["SERVICE_CONTROL_POLICY"], (policyType) => OrganizationsRootPolicyType(`${id}${toLogicalIdSegment(policyType)}PolicyType`, {
        rootId: root.rootId,
        policyType,
    }), { concurrency: "unbounded" });
    const trustedServicePrincipals = [
        ...(props.trustedServicePrincipals ?? []),
        ...(props.identityCenter ? ["sso.amazonaws.com"] : []),
    ];
    const trustedServiceAccess = yield* Effect.forEach([...new Set(trustedServicePrincipals)], (servicePrincipal) => OrganizationsTrustedServiceAccess(`${id}${toLogicalIdSegment(servicePrincipal)}TrustedAccess`, { servicePrincipal }), { concurrency: "unbounded" });
    const organizationalUnits = {};
    const accounts = {};
    const targets = {
        root: { targetId: root.rootId },
    };
    yield* createOrganizationalUnits({
        id,
        parentId: root.rootId,
        sharedTags,
        specs: props.organizationalUnits ?? defaultTenantOrganizationalUnits(),
        organizationalUnits,
        accounts,
        targets,
    });
    const delegatedAdministrators = [];
    const identityCenter = props.identityCenter
        ? yield* createTenantIdentityCenter({
            id,
            spec: props.identityCenter,
            accounts,
            sharedTags,
            delegatedAdministrators,
        })
        : undefined;
    const policies = {};
    const policyAttachments = [];
    for (const policySpec of props.policies ?? []) {
        const policy = yield* OrganizationsPolicy(`${id}${toLogicalIdSegment(policySpec.key)}Policy`, {
            name: policySpec.name,
            description: policySpec.description,
            type: policySpec.type ?? "SERVICE_CONTROL_POLICY",
            document: policySpec.document,
            tags: mergeTags(sharedTags, policySpec.tags),
        });
        policies[policySpec.key] = policy;
        for (const targetKey of policySpec.targetKeys) {
            const target = targets[targetKey];
            if (!target) {
                return yield* Effect.fail(new Error(`Unknown tenant policy target '${targetKey}' for policy '${policySpec.key}'`));
            }
            policyAttachments.push(yield* OrganizationsPolicyAttachment(`${id}${toLogicalIdSegment(policySpec.key)}${toLogicalIdSegment(targetKey)}Attachment`, {
                policyId: policy.policyId,
                targetId: target.targetId,
            }));
        }
    }
    return {
        organization,
        root,
        policyTypes,
        trustedServiceAccess,
        delegatedAdministrators,
        organizationalUnits,
        accounts,
        policies,
        policyAttachments,
        identityCenter,
    };
});
const createOrganizationalUnits = ({ id, parentId, sharedTags, specs, organizationalUnits, accounts, targets, }) => Effect.gen(function* () {
    for (const spec of specs) {
        const ou = yield* AwsOrganizationalUnit(`${id}${toLogicalIdSegment(spec.key)}Ou`, {
            parentId,
            name: spec.name ?? spec.key,
            tags: mergeTags(sharedTags, spec.tags),
        });
        organizationalUnits[spec.key] = ou;
        targets[spec.key] = { targetId: ou.ouId };
        for (const accountSpec of spec.accounts ?? []) {
            const account = yield* OrganizationAccount(`${id}${toLogicalIdSegment(accountSpec.key)}Account`, {
                ...accountSpec,
                parentId: ou.ouId,
                tags: mergeTags(sharedTags, accountSpec.tags),
            });
            accounts[accountSpec.key] = account;
            targets[accountSpec.key] = { targetId: account.accountId };
        }
        if (spec.children?.length) {
            yield* createOrganizationalUnits({
                id,
                parentId: ou.ouId,
                sharedTags,
                specs: spec.children,
                organizationalUnits,
                accounts,
                targets,
            });
        }
    }
});
const createTenantIdentityCenter = Effect.fn(function* ({ id, spec, accounts, delegatedAdministrators, }) {
    const instance = yield* IdentityCenter.Instance(`${id}IdentityCenter`, {
        mode: spec.mode ?? "existing",
        instanceArn: spec.instanceArn,
        name: spec.name,
    });
    if (spec.delegatedAdminAccountKey) {
        const account = accounts[spec.delegatedAdminAccountKey];
        if (!account) {
            return yield* Effect.fail(new Error(`Unknown delegated admin account '${spec.delegatedAdminAccountKey}'`));
        }
        delegatedAdministrators.push(yield* OrganizationsDelegatedAdministrator(`${id}${toLogicalIdSegment(spec.delegatedAdminAccountKey)}IdentityCenterDelegatedAdmin`, {
            accountId: account.accountId,
            servicePrincipal: "sso.amazonaws.com",
        }));
    }
    const groups = {};
    for (const groupSpec of spec.groups ?? []) {
        groups[groupSpec.key] = yield* IdentityCenter.Group(`${id}${toLogicalIdSegment(groupSpec.key)}Group`, {
            identityStoreId: instance.identityStoreId,
            displayName: groupSpec.displayName,
            description: groupSpec.description,
        });
    }
    const permissionSets = {};
    for (const permissionSetSpec of spec.permissionSets ?? []) {
        permissionSets[permissionSetSpec.key] = yield* IdentityCenter.PermissionSet(`${id}${toLogicalIdSegment(permissionSetSpec.key)}PermissionSet`, {
            instanceArn: instance.instanceArn,
            name: permissionSetSpec.name,
            description: permissionSetSpec.description,
            sessionDuration: permissionSetSpec.sessionDuration,
            relayState: permissionSetSpec.relayState,
        });
    }
    const assignments = {};
    for (const assignmentSpec of spec.assignments ?? []) {
        const account = accounts[assignmentSpec.accountKey];
        if (!account) {
            return yield* Effect.fail(new Error(`Unknown assignment account '${assignmentSpec.accountKey}'`));
        }
        const permissionSet = permissionSets[assignmentSpec.permissionSetKey];
        if (!permissionSet) {
            return yield* Effect.fail(new Error(`Unknown assignment permission set '${assignmentSpec.permissionSetKey}'`));
        }
        const principalId = assignmentSpec.groupKey !== undefined
            ? groups[assignmentSpec.groupKey]?.groupId
            : assignmentSpec.principalId;
        if (!principalId) {
            return yield* Effect.fail(new Error(`Unable to resolve principal for assignment '${assignmentSpec.key ?? `${assignmentSpec.permissionSetKey}-${assignmentSpec.accountKey}`}'`));
        }
        const key = assignmentSpec.key ??
            `${assignmentSpec.permissionSetKey}-${assignmentSpec.accountKey}-${assignmentSpec.groupKey ?? principalId}`;
        assignments[key] = yield* IdentityCenter.AccountAssignment(`${id}${toLogicalIdSegment(key)}Assignment`, {
            instanceArn: instance.instanceArn,
            permissionSetArn: permissionSet.permissionSetArn,
            principalId,
            principalType: assignmentSpec.groupKey
                ? "GROUP"
                : (assignmentSpec.principalType ?? "USER"),
            targetId: account.accountId,
        });
    }
    return {
        instance,
        groups,
        permissionSets,
        assignments,
    };
});
const mergeTags = (shared, tags) => ({
    ...shared,
    ...tags,
});
//# sourceMappingURL=TenantRoot.js.map