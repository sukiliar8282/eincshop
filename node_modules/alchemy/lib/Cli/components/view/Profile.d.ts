import type { JSX } from "react";
export interface ProfileProviderDisplay {
    readonly name: string;
    readonly method: string;
    readonly status: "ready" | "configured" | "reauth" | "reconfigure" | "error";
    readonly lines: ReadonlyArray<string>;
}
export interface ProfileListDisplay {
    readonly name: string;
    readonly active: boolean;
    readonly providers: ReadonlyArray<{
        readonly name: string;
        readonly method: string;
    }>;
}
/** Provider credential status → glyph + color + label, shared with the dashboard. */
export declare const providerStatusStyle: {
    readonly ready: {
        readonly color: "#9acb69";
        readonly glyph: "success";
        readonly label: "ready";
    };
    readonly configured: {
        readonly color: "#efb85a";
        readonly glyph: "warning";
        readonly label: "configured";
    };
    readonly reauth: {
        readonly color: "#efb85a";
        readonly glyph: "refresh";
        readonly label: "needs re-login";
    };
    readonly reconfigure: {
        readonly color: "#efb85a";
        readonly glyph: "edit";
        readonly label: "needs setup";
    };
    readonly error: {
        readonly color: "#d96f52";
        readonly glyph: "error";
        readonly label: "error";
    };
};
/**
 * Styling for the account-edit flow's row states, shared between the
 * `profile edit` cycle prompt and the dashboard's edit screen. `keep` is
 * the neutral state for connected providers, `skip` for unconnected ones.
 */
export declare const editStateStyle: {
    readonly keep: {
        readonly icon: "selected";
        readonly variant: "success";
        readonly label: undefined;
    };
    readonly skip: {
        readonly icon: "unselected";
        readonly variant: "neutral";
        readonly label: undefined;
    };
    readonly add: {
        readonly icon: "add";
        readonly variant: "success";
        readonly label: "add";
    };
    readonly reconfigure: {
        readonly icon: "edit";
        readonly variant: "warning";
        readonly label: "reconfigure";
    };
    readonly remove: {
        readonly icon: "error";
        readonly variant: "error";
        readonly label: "remove";
    };
};
export type EditState = keyof typeof editStateStyle;
/** Options every provider block shares; the dashboard threads them through. */
export interface ProviderBlockOptions {
    /** Muted hint appended to rows with `status: "reauth"`. */
    readonly reauthHint?: string;
    /** Provider whose detail rows are temporarily replaced by refresh status. */
    readonly refreshingProvider?: string;
    /** Provider currently focused by an interactive parent view. */
    readonly focusedProvider?: string;
    /**
     * Reserve the list-cursor column (see `Pointer`) so an interactive parent
     * can mark the focused provider without shifting the table.
     */
    readonly focusColumn?: boolean;
}
/** Column widths computed over every provider so windowed blocks stay aligned. */
export declare const providerColumnWidths: (providers: ReadonlyArray<ProfileProviderDisplay>) => {
    readonly nameWidth: number;
    readonly methodWidth: number;
};
/**
 * Rows a `ProviderBlock` occupies: one blank spacer row above every block
 * but the first, the header row, then the detail rows (at least one, so the
 * refresh spinner fits inside the same reserved height). The dashboard
 * windows providers by this number, so keep it in step with the layout.
 */
export declare const providerBlockHeight: (provider: ProfileProviderDisplay, first: boolean) => number;
/**
 * One provider in the table: `[cursor] name  method  status` on the header
 * row, its details indented beneath. Blocks are separated by a blank row
 * rather than a rule, and the focused block is marked by the cursor glyph and
 * a brand-coloured name — never by a rail.
 */
export declare function ProviderBlock({ provider, first, nameWidth, methodWidth, reauthHint, refreshingProvider, focusedProvider, focusColumn, }: ProviderBlockOptions & {
    readonly provider: ProfileProviderDisplay;
    readonly first: boolean;
    readonly nameWidth: number;
    readonly methodWidth: number;
}): JSX.Element;
/**
 * Provider table body shared by `profile show` and the dashboard's detail
 * pane, so the two render identically. The dashboard passes `reauthHint` to
 * advertise its `r` keybinding on rows that need a re-login.
 */
export declare function ProfileDetailsBody({ providers, ...options }: ProviderBlockOptions & {
    readonly providers: ReadonlyArray<ProfileProviderDisplay>;
}): JSX.Element;
/**
 * View builders consumed by `CliKit.print` and the interactive profile app.
 */
export declare const profileListNode: (profiles: ReadonlyArray<ProfileListDisplay>) => JSX.Element;
export declare const profileDetailsNode: (profile: string, providers: ReadonlyArray<ProfileProviderDisplay>, active: boolean) => JSX.Element;
export declare const profileNoticeNode: (profile: string, message: string) => JSX.Element;
export declare const currentProfileNode: (name: string, source: string) => JSX.Element;
//# sourceMappingURL=Profile.d.ts.map