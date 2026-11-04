import { buildNamespaceTree, buildPlanSummary, flattenTree, } from "../../NamespaceTree.js";
import { isInProgress, isTerminalStatus } from "./statusStyle.js";
/**
 * Only resources and actions receive apply events and settle. Namespaces are
 * grouping only, and bindings are reconciled by their host resource, so
 * counting them would leave the progress total unreachable.
 */
const isProgressRow = (row) => row.type === "resource" || row.type === "task";
const getRowKey = (item) => item.path.join("/");
const findCrudByLogicalId = (plan, id) => [...Object.values(plan.resources), ...Object.values(plan.deletions)].find((item) => item?.resource.LogicalId === id);
const buildRows = (plan, detailed) => {
    const resources = [
        ...Object.values(plan.resources),
        ...Object.values(plan.deletions).filter((item) => item !== undefined),
    ];
    const actions = [
        ...Object.values(plan.actions ?? {}),
        ...Object.values(plan.actionDeletions ?? {}),
    ].filter((task) => task !== undefined);
    return flattenTree(buildNamespaceTree(resources, actions), {
        includePropertyYaml: detailed,
    }).map((item) => {
        if (item.type === "namespace") {
            return {
                key: getRowKey(item),
                type: "namespace",
                id: item.id,
                depth: item.depth,
                action: item.action,
            };
        }
        if (item.type === "binding") {
            return {
                key: getRowKey(item),
                type: "binding",
                id: item.bindingSid ?? item.id,
                depth: item.depth,
                action: item.action,
                hostKey: item.path.slice(0, -1).join("/"),
            };
        }
        if (item.type === "action") {
            return {
                key: getRowKey(item),
                type: "task",
                id: item.id,
                depth: item.depth,
                action: item.action,
            };
        }
        return {
            key: getRowKey(item),
            type: "resource",
            id: item.id,
            resourceType: item.resourceType ?? "Unknown",
            depth: item.depth,
            action: item.action,
            providerMode: item.providerMode,
            fromProviderMode: item.fromProviderMode,
            propertyYaml: item.propertyYaml,
            persistedApplyStatus: item.action === "noop"
                ? (() => {
                    const crud = findCrudByLogicalId(plan, item.id);
                    return crud?.action === "noop" ? crud.state.status : undefined;
                })()
                : undefined,
        };
    });
};
export const initialResourceState = (row) => ({
    key: row.key,
    id: row.id,
    status: row.action === "noop" ? (row.persistedApplyStatus ?? "created") : "pending",
});
const buildInitialTasks = (rows) => new Map(rows.flatMap((row) => {
    if (row.type === "resource")
        return [[row.key, initialResourceState(row)]];
    if (row.type === "task") {
        return [
            [
                row.key,
                {
                    key: row.key,
                    id: row.id,
                    status: row.action === "noop" ? "skipped" : "pending",
                },
            ],
        ];
    }
    return [];
}));
export class PlanTree {
    rows;
    progressRows;
    summary;
    mode;
    detailed;
    titleDetail;
    defaultMode;
    state;
    listeners = new Set();
    constructor(plan, options = {}) {
        this.detailed = options.detailed ?? false;
        this.mode = options.mode ?? "review";
        this.titleDetail = options.titleDetail;
        this.defaultMode = plan.defaultMode;
        this.rows = "rows" in plan ? plan.rows : buildRows(plan, this.detailed);
        this.progressRows = this.rows.filter(isProgressRow);
        this.summary = "rows" in plan ? plan.summary : buildPlanSummary(plan);
        this.state = {
            tasks: buildInitialTasks(this.rows),
            label: options.label ?? "Plan",
            expanded: options.expanded ?? true,
            viewport: options.viewport ?? "virtual",
            busy: options.busy ?? false,
            outcome: undefined,
            output: undefined,
            view: "plan",
        };
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    snapshot() {
        return this.state;
    }
    progress() {
        let completed = 0;
        let failures = 0;
        let total = 0;
        for (const row of this.progressRows) {
            const status = this.state.tasks.get(row.key)?.status;
            if (row.action !== "noop") {
                total++;
                if (status !== undefined && isTerminalStatus(status))
                    completed++;
            }
            if (status === "fail")
                failures++;
        }
        return { completed, failures, total };
    }
    setExpanded(expanded) {
        this.update({ expanded });
    }
    setLabel(label) {
        this.update({ label });
    }
    setViewport(viewport) {
        this.update({ viewport });
    }
    setBusy(busy) {
        this.update({
            busy,
            outcome: busy ? undefined : this.state.outcome,
            view: busy ? "plan" : this.state.view,
        });
    }
    finish(outcome, label, view = this.state.view) {
        this.update({ busy: false, outcome, label, view });
    }
    setOutput(output) {
        this.update({ output });
    }
    setView(view) {
        this.update({ view });
    }
    emit(event) {
        const tasks = new Map(this.state.tasks);
        const key = event.fqn;
        const now = Date.now();
        const timing = (current, status) => {
            const startedAt = current?.startedAt ?? (isInProgress(status) ? now : undefined);
            return {
                startedAt,
                elapsedMs: isTerminalStatus(status) && startedAt !== undefined
                    ? now - startedAt
                    : current?.elapsedMs,
            };
        };
        if (event._tag === "apply.resource.status") {
            const current = tasks.get(key);
            if (current) {
                tasks.set(key, {
                    key,
                    id: event.id,
                    status: event.status,
                    message: event.message ?? current.message,
                    ...timing(current, event.status),
                });
            }
        }
        else {
            const current = tasks.get(key);
            if (current)
                tasks.set(key, { ...current, message: event.message });
        }
        this.update({ tasks });
    }
    update(patch) {
        this.state = { ...this.state, ...patch };
        for (const listener of this.listeners)
            listener();
    }
}
//# sourceMappingURL=PlanTree.js.map