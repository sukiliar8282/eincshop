import { Services } from "@distilled.cloud/hetzner";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../AdoptPolicy.js";
import { deepEqual, isResolved } from "../Diff.js";
import { createPhysicalName } from "../PhysicalName.js";
import * as Provider from "../Provider.js";
import { Resource } from "../Resource.js";
import { recordsEqual } from "../Util/equal.js";
import { waitForActions } from "./actions.js";
import { alchemyStackSelector, createInternalLabels, diffLabels, hasAlchemyLabels, labelSelector, stripInternalLabels, toLabels, } from "./Labels.js";
/**
 * A Hetzner Cloud firewall — a named set of inbound/outbound rules that
 * can be applied to one or more Servers.
 *
 * Name, rules, labels, and `applyTo` are all mutable. Changing the name
 * updates the existing firewall in place (it is unique per project).
 * @see https://docs.hetzner.cloud/reference/cloud#firewalls
 *
 * ### Creating a Firewall
 * **Example:** Basic firewall
 * ```typescript
 * const web = yield* Hetzner.Firewall("web", {
 *   rules: [
 *     {
 *       direction: "in",
 *       protocol: "tcp",
 *       port: "22",
 *       sourceIps: ["0.0.0.0/0", "::/0"],
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Firewall applied to a Server
 * ```typescript
 * const server = yield* Hetzner.Server("app", {
 *   image: "ubuntu-24.04",
 *   serverType: "cx22",
 *   location: "nbg1",
 * });
 * const web = yield* Hetzner.Firewall("web", {
 *   applyTo: [server],
 *   rules: [
 *     {
 *       direction: "in",
 *       protocol: "tcp",
 *       port: "443",
 *       sourceIps: ["0.0.0.0/0", "::/0"],
 *     },
 *   ],
 * });
 * ```
 *
 * ### Updating rules
 * **Example:** Replace the rule set
 * ```typescript
 * const web = yield* Hetzner.Firewall("web", {
 *   rules: [
 *     {
 *       direction: "in",
 *       protocol: "tcp",
 *       port: "80",
 *       sourceIps: ["0.0.0.0/0", "::/0"],
 *     },
 *     {
 *       direction: "in",
 *       protocol: "tcp",
 *       port: "443",
 *       sourceIps: ["0.0.0.0/0", "::/0"],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const Firewall = Resource("Hetzner.Firewall");
export class FirewallNotCreated extends Data.TaggedError("Hetzner.FirewallNotCreated") {
}
const NAME_MAX_LENGTH = 128;
const createFirewallName = (id, name) => Effect.gen(function* () {
    if (name !== undefined)
        return name;
    return yield* createPhysicalName({ id, maxLength: NAME_MAX_LENGTH });
});
const compactLabels = (labels) => Object.fromEntries(Object.entries(labels ?? {}).filter((entry) => entry[1] !== undefined));
const desiredLabels = Effect.fn(function* (id, user) {
    const internal = yield* createInternalLabels(id);
    return { ...toLabels(user), ...internal };
});
const sortIps = (ips) => [...(ips ?? [])].map((ip) => ip.toLowerCase()).sort();
const normalizeRule = (rule) => {
    const description = rule.description ?? undefined;
    const port = rule.port ?? undefined;
    return {
        direction: rule.direction,
        protocol: rule.protocol,
        ...(description !== undefined ? { description } : {}),
        ...(port !== undefined && port.length > 0 ? { port } : {}),
        sourceIps: sortIps(rule.sourceIps),
        destinationIps: sortIps(rule.destinationIps),
    };
};
const fromObservedRule = (rule) => normalizeRule({
    description: rule.description,
    direction: rule.direction,
    protocol: rule.protocol,
    port: rule.port,
    sourceIps: rule.source_ips,
    destinationIps: rule.destination_ips,
});
const toWireRule = (rule) => {
    const description = rule.description;
    const port = (rule.protocol === "tcp" || rule.protocol === "udp") && rule.port
        ? rule.port
        : undefined;
    return {
        direction: rule.direction,
        protocol: rule.protocol,
        ...(description !== undefined ? { description } : {}),
        ...(port !== undefined ? { port } : {}),
        ...(rule.sourceIps !== undefined
            ? { source_ips: [...rule.sourceIps] }
            : {}),
        ...(rule.destinationIps !== undefined
            ? { destination_ips: [...rule.destinationIps] }
            : {}),
    };
};
const desiredRules = (rules) => (rules ?? []).map((rule) => normalizeRule({
    description: rule.description,
    direction: rule.direction,
    protocol: rule.protocol,
    port: rule.port,
    sourceIps: rule.sourceIps,
    destinationIps: rule.destinationIps,
}));
const rulesEqual = (a, b) => deepEqual(a, b, { stripNullish: true });
const serverIdOf = (value) => {
    if (value === null || typeof value !== "object")
        return undefined;
    const rec = value;
    if (typeof rec.serverId === "number")
        return rec.serverId;
    if (typeof rec.id === "number")
        return rec.id;
    return undefined;
};
const desiredServerIds = (applyTo) => {
    const ids = new Set();
    for (const item of applyTo ?? []) {
        const id = serverIdOf(item);
        if (id !== undefined)
            ids.add(id);
    }
    return [...ids].sort((a, b) => a - b);
};
const observedServerIds = (appliedTo) => {
    const ids = new Set();
    for (const item of appliedTo) {
        if (item.type === "server" && item.server?.id !== undefined) {
            ids.add(item.server.id);
        }
    }
    return [...ids].sort((a, b) => a - b);
};
const toAppliedTo = (appliedTo) => observedServerIds(appliedTo).map((serverId) => ({
    type: "server",
    serverId,
}));
const toServerApplyItems = (ids) => ids.map((id) => ({ type: "server", server: { id } }));
const detachItems = (appliedTo) => {
    const items = [];
    for (const item of appliedTo) {
        if (item.type === "server" && item.server?.id !== undefined) {
            items.push({ type: "server", server: { id: item.server.id } });
        }
        else if (item.type === "label_selector" &&
            item.label_selector?.selector !== undefined) {
            items.push({
                type: "label_selector",
                label_selector: { selector: item.label_selector.selector },
            });
        }
    }
    return items;
};
const toAttrs = (firewall) => ({
    id: firewall.id,
    name: firewall.name,
    created: firewall.created,
    rules: firewall.rules.map(fromObservedRule),
    appliedTo: toAppliedTo(firewall.applied_to),
    labels: stripInternalLabels(compactLabels(firewall.labels)),
});
const getById = (id) => Services.firewalls.getFirewall({ id }).pipe(Effect.map(({ firewall }) => firewall), Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
const findByName = (name) => Effect.gen(function* () {
    const { firewalls } = yield* Services.firewalls.listFirewalls({
        name,
        per_page: 50,
    });
    return firewalls.find((item) => item.name === name);
});
const findByLabels = (id) => Effect.gen(function* () {
    const selector = labelSelector(yield* createInternalLabels(id));
    const { firewalls } = yield* Services.firewalls.listFirewalls({
        label_selector: selector,
        per_page: 50,
    });
    return firewalls[0];
});
const observe = (input) => Effect.gen(function* () {
    if (input.output?.id !== undefined) {
        const byId = yield* getById(input.output.id);
        if (byId !== undefined)
            return byId;
    }
    const byName = yield* findByName(input.name);
    if (byName !== undefined)
        return byName;
    return yield* findByLabels(input.id);
});
const waitActions = (actions) => waitForActions(actions.map((action) => action.id));
const ensureFirewall = Effect.fn(function* (input) {
    const created = yield* Services.firewalls
        .createFirewall({
        name: input.name,
        labels: input.labels,
        ...(input.rules.length > 0 ? { rules: input.rules.map(toWireRule) } : {}),
        ...(input.serverIds.length > 0
            ? { apply_to: toServerApplyItems(input.serverIds) }
            : {}),
    })
        .pipe(Effect.catchTag("Conflict", () => findByName(input.name).pipe(Effect.flatMap((existing) => existing !== undefined
        ? Effect.succeed({ firewall: existing, actions: [] })
        : Services.firewalls
            .listFirewalls({
            name: input.name,
            per_page: 1,
        })
            .pipe(Effect.map(({ firewalls }) => ({
            firewall: firewalls[0],
            actions: [],
        })))))));
    yield* waitActions(created.actions ?? []);
    return created.firewall ?? (yield* findByName(input.name));
});
const syncNameAndLabels = Effect.fn(function* (input) {
    const nameChanged = input.observedName !== input.desiredName;
    const { upsert, removed } = diffLabels(input.observedLabels, input.desiredLabels);
    const labelsChanged = upsert.length > 0 || removed.length > 0;
    if (!nameChanged && !labelsChanged)
        return;
    yield* Services.firewalls.updateFirewall({
        id: input.firewallId,
        ...(nameChanged ? { name: input.desiredName } : {}),
        ...(labelsChanged ? { labels: input.desiredLabels } : {}),
    });
});
const syncRules = Effect.fn(function* (input) {
    if (rulesEqual(input.observed, input.desired))
        return;
    const { actions } = yield* Services.firewallActions.setFirewallRules({
        id: input.firewallId,
        rules: input.desired.map(toWireRule),
    });
    yield* waitActions(actions);
});
const syncApplyTo = Effect.fn(function* (input) {
    const observedIds = new Set(observedServerIds(input.observed));
    const desiredIds = new Set(input.desiredIds);
    const toAdd = [...desiredIds].filter((id) => !observedIds.has(id));
    const toRemove = [...observedIds].filter((id) => !desiredIds.has(id));
    if (toAdd.length > 0) {
        const { actions } = yield* Services.firewallActions.applyFirewallToResources({
            id: input.firewallId,
            apply_to: toServerApplyItems(toAdd),
        });
        yield* waitActions(actions);
    }
    if (toRemove.length > 0) {
        const { actions } = yield* Services.firewallActions.removeFirewallFromResources({
            id: input.firewallId,
            remove_from: toServerApplyItems(toRemove),
        });
        yield* waitActions(actions);
    }
});
const detachAll = Effect.fn(function* (firewallId, appliedTo) {
    const removeFrom = detachItems(appliedTo);
    if (removeFrom.length === 0)
        return;
    const result = yield* Services.firewallActions
        .removeFirewallFromResources({
        id: firewallId,
        remove_from: removeFrom,
    })
        .pipe(Effect.catchTag(["NotFound", "UnprocessableEntity"], () => Effect.succeed({ actions: [] })));
    yield* waitActions(result.actions);
});
export const FirewallProvider = () => Provider.succeed(Firewall, {
    stables: ["id", "created"],
    list: Effect.fn(function* () {
        const rows = yield* Services.firewalls.listFirewalls
            .items({ label_selector: alchemyStackSelector, per_page: 50 })
            .pipe(Stream.runCollect);
        return Array.from(rows, toAttrs);
    }),
    diff: Effect.fn(function* ({ id, olds, news, output }) {
        if (!isResolved(news))
            return undefined;
        const oldName = output?.name ?? (yield* createFirewallName(id, olds?.name));
        const newName = news.name ?? oldName;
        if (oldName !== newName) {
            return { action: "update" };
        }
        if (!rulesEqual(desiredRules(olds?.rules), desiredRules(news.rules)) ||
            !recordsEqual(olds?.labels ?? {}, news.labels ?? {})) {
            return { action: "update" };
        }
        const oldIds = desiredServerIds(olds?.applyTo);
        const newIds = desiredServerIds(news.applyTo);
        if (!deepEqual(oldIds, newIds)) {
            return { action: "update" };
        }
        if (output !== undefined) {
            if (!rulesEqual(output.rules, desiredRules(news.rules))) {
                return { action: "update" };
            }
            const outputIds = output.appliedTo.map((item) => item.serverId);
            if (!deepEqual([...outputIds].sort((a, b) => a - b), newIds)) {
                return { action: "update" };
            }
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, olds, output }) {
        const name = output?.name ??
            (olds?.name !== undefined
                ? olds.name
                : output !== undefined
                    ? undefined
                    : yield* createFirewallName(id, olds?.name));
        const observed = output?.id !== undefined
            ? ((yield* getById(output.id)) ??
                (name !== undefined ? yield* findByName(name) : undefined) ??
                (yield* findByLabels(id)))
            : name !== undefined
                ? ((yield* findByName(name)) ?? (yield* findByLabels(id)))
                : yield* findByLabels(id);
        if (observed === undefined)
            return undefined;
        const attrs = toAttrs(observed);
        const ours = yield* hasAlchemyLabels(id, compactLabels(observed.labels));
        return ours ? attrs : Unowned(attrs);
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const name = news.name ?? output?.name ?? (yield* createFirewallName(id, news.name));
        const labels = yield* desiredLabels(id, news.labels);
        const rules = desiredRules(news.rules);
        const serverIds = desiredServerIds(news.applyTo);
        // Observe — cached id is a hint; cloud state is authoritative.
        let current = yield* observe({ id, name, output });
        // Ensure — create if missing. A Conflict is a name-race; look up
        // the existing firewall and fall through to sync.
        if (current === undefined) {
            yield* ensureFirewall({
                name,
                labels,
                rules,
                serverIds,
            });
        }
        if (current === undefined) {
            current = yield* observe({ id, name, output });
        }
        if (current === undefined) {
            return yield* new FirewallNotCreated({ name });
        }
        // Sync each mutable aspect against observed cloud state.
        yield* syncNameAndLabels({
            firewallId: current.id,
            observedName: current.name,
            desiredName: name,
            observedLabels: compactLabels(current.labels),
            desiredLabels: labels,
        });
        yield* syncRules({
            firewallId: current.id,
            observed: current.rules.map(fromObservedRule),
            desired: rules,
        });
        yield* syncApplyTo({
            firewallId: current.id,
            observed: current.applied_to,
            desiredIds: serverIds,
        });
        const fresh = (yield* getById(current.id)) ?? current;
        return toAttrs(fresh);
    }),
    delete: Effect.fn(function* ({ output }) {
        const id = output.id;
        const observed = yield* getById(id);
        if (observed !== undefined) {
            yield* detachAll(id, observed.applied_to);
        }
        yield* Services.firewalls.deleteFirewall({ id }).pipe(Effect.catchTag("NotFound", () => Effect.void), Effect.catchTag("UnprocessableEntity", () => Effect.gen(function* () {
            const again = yield* getById(id);
            if (again === undefined)
                return;
            yield* detachAll(id, again.applied_to);
            yield* Services.firewalls
                .deleteFirewall({ id })
                .pipe(Effect.catchTag("NotFound", () => Effect.void));
        })));
    }),
});
//# sourceMappingURL=Firewall.js.map