import { theme } from "../../CliKit/index.js";
export const actionStyle = {
    create: { color: theme.color.success, icon: "add" },
    update: { color: theme.color.warning, icon: "edit" },
    adopted: { color: theme.color.magenta, icon: "adopt" },
    delete: { color: theme.color.danger, icon: "delete" },
    orphaned: { color: theme.color.coral, icon: "orphan" },
    replace: { color: theme.color.magenta, icon: "replace" },
    noop: { color: theme.color.muted, icon: "bullet" },
    mixed: { color: theme.color.info, icon: "info" },
    run: { color: theme.color.info, icon: "run" },
};
export const applyStatusColor = (status) => {
    switch (status) {
        case "no change":
        case "pending":
        case "skipped":
            return theme.color.muted;
        case "attaching":
        case "post-attach":
        case "pre-creating":
            return theme.color.info;
        case "creating":
        case "creating replacement":
        case "created":
        case "orphaning":
        case "orphaned":
            return theme.color.success;
        case "updating":
        case "adopting":
        case "replacing":
        case "replaced":
        case "updated":
        case "adopted":
            return theme.color.warning;
        case "deleting":
        case "deleted":
            return theme.color.danger;
        case "running":
        case "ran":
            return theme.color.info;
        case "fail":
            return theme.color.danger;
        default:
            return undefined;
    }
};
/** Settled states — the row will not change again. */
export const isTerminalStatus = (status) => status === "created" ||
    status === "updated" ||
    status === "adopted" ||
    status === "deleted" ||
    status === "orphaned" ||
    status === "replaced" ||
    status === "ran" ||
    status === "skipped" ||
    status === "fail";
export const isInProgress = (status) => status === "attaching" ||
    status === "post-attach" ||
    status === "pre-creating" ||
    status === "creating" ||
    status === "creating replacement" ||
    status === "updating" ||
    status === "adopting" ||
    status === "deleting" ||
    status === "orphaning" ||
    status === "replacing" ||
    status === "running";
//# sourceMappingURL=statusStyle.js.map