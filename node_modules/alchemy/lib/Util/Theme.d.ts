import type { Paint } from "@alchemy.run/sigil/color";
export declare const theme: {
    readonly color: {
        readonly brand: "#e28a5b";
        readonly accent: "#9acb69";
        readonly accentBright: "#c5df8c";
        readonly accentMuted: "#60764b";
        readonly success: "#9acb69";
        readonly warning: "#efb85a";
        readonly danger: "#d96f52";
        readonly magenta: "#c084d6";
        readonly info: "#b6c77a";
        readonly sage: "#b8cf83";
        readonly olive: "#9ea85e";
        readonly coral: "#ef9a6a";
        readonly muted: "#8f887c";
        readonly diffAddBackground: "#263b2a";
        readonly diffRemoveBackground: "#422a26";
        readonly onAccent: "#14110d";
        readonly emphasis: "#f5f0e6";
    };
    readonly space: {
        readonly inline: 1;
        readonly indent: 2;
        readonly section: 1;
    };
    readonly paint: {
        readonly focus: "#e28a5b";
        readonly interactive: "#e28a5b";
        readonly info: "#b6c77a";
        readonly success: "#9acb69";
        readonly warning: "#efb85a";
        readonly error: "#d96f52";
    };
    readonly glyph: {
        readonly section: "●";
        /**
         * Marks the step currently being answered — the same "active one" glyph
         * the profile tabs use. Deliberately not a chevron so the list cursor
         * (`pointer`) is the only chevron on screen.
         */
        readonly active: "◆";
        /** List cursor: the one focus glyph shared by every prompt and dashboard row. */
        readonly pointer: "❯";
        readonly success: "✓";
        readonly warning: "!";
        readonly error: "×";
        readonly info: "•";
        readonly selected: "◆";
        readonly unselected: "·";
        readonly checked: "✓";
        readonly unchecked: "·";
        readonly add: "+";
        readonly adopt: "(+)";
        readonly edit: "~";
        readonly refresh: "↻";
        readonly delete: "-";
        readonly orphan: "(-)";
        readonly replace: "↔";
        readonly run: "▶";
        readonly bar: "┊";
        readonly mask: "•";
        readonly bullet: "·";
        readonly overflowUp: "↑";
        readonly overflowDown: "↓";
        readonly overflowLeft: "‹";
        readonly overflowRight: "›";
    };
    /**
     * Key-hint labels for KeyBar footers. Resolve through `useKeyGlyphs()`
     * (components/Environment.tsx) so ASCII terminals get readable fallbacks
     * instead of mojibake.
     */
    readonly keyHint: {
        readonly enter: "↩";
        readonly upDown: "↑/↓";
        readonly leftRight: "←/→";
        readonly escape: "esc";
        readonly space: "space";
        readonly tab: "tab";
        readonly yesNo: "y/n";
    };
};
export type KeyHint = {
    readonly [Key in keyof typeof theme.keyHint]: string;
};
export type GlyphName = keyof typeof theme.glyph;
export declare const asciiGlyphs: {
    readonly [Key in GlyphName]: string;
};
export declare const glyphsFor: (unicode: boolean) => {
    readonly active: string;
    readonly add: string;
    readonly adopt: string;
    readonly bar: string;
    readonly bullet: string;
    readonly checked: string;
    readonly delete: string;
    readonly edit: string;
    readonly error: string;
    readonly info: string;
    readonly mask: string;
    readonly orphan: string;
    readonly overflowDown: string;
    readonly overflowLeft: string;
    readonly overflowRight: string;
    readonly overflowUp: string;
    readonly pointer: string;
    readonly refresh: string;
    readonly replace: string;
    readonly run: string;
    readonly section: string;
    readonly selected: string;
    readonly success: string;
    readonly unchecked: string;
    readonly unselected: string;
    readonly warning: string;
};
export declare const spinnerFramesFor: (unicode: boolean) => readonly string[];
export type StatusVariant = "info" | "success" | "warning" | "error";
export declare const statusColor: (variant: StatusVariant) => string;
export declare const statusPaint: (variant: StatusVariant) => Paint;
//# sourceMappingURL=Theme.d.ts.map