import type { ReactNode } from "react";
import { type StatusVariant } from "../../../Util/Theme.ts";
export interface StatusProps {
    readonly variant?: StatusVariant;
    readonly children?: ReactNode;
    readonly detail?: ReactNode;
}
export declare function Status({ variant, children, detail }: StatusProps): import("react").JSX.Element;
export type ToastProps = StatusProps;
/**
 * Compact application notice. Severity is carried by the status glyph and
 * its colour alone — the same vocabulary as transcript lines — so a notice
 * row never needs a rail of its own.
 */
export declare function Toast({ variant, children, detail }: ToastProps): import("react").JSX.Element;
export interface AlertProps extends StatusProps {
    readonly title?: ReactNode;
}
/** Glyph + bold title on one row, body indented beneath it. */
export declare function Alert({ variant, title, children, detail, }: AlertProps): import("react").JSX.Element;
export interface KeyBarProps {
    readonly keys: ReadonlyArray<readonly [key: string, label: string]>;
    readonly marginTop?: number;
    readonly inline?: boolean;
    /** Widget rendered before the key hints. */
    readonly before?: ReactNode;
    /** Widget rendered after the key hints. */
    readonly after?: ReactNode;
    /** Draw border rails between populated widget/key sections. */
    readonly divider?: boolean;
}
export declare function KeyBar({ keys, marginTop, inline, before, after, divider, }: KeyBarProps): import("react").JSX.Element;
export declare const useSpinnerFrame: () => string;
/**
 * Spinner-as-status-icon: one animated frame, colorable so it can stand in
 * for a status glyph in trees and progress rows.
 */
type SpinnerGlyphProps = {
    readonly color?: string;
};
export declare function SpinnerGlyph({ color }: SpinnerGlyphProps): import("react").JSX.Element;
type SpinnerProps = {
    readonly label: ReactNode;
    readonly detail?: ReactNode;
};
export declare function Spinner({ label, detail }: SpinnerProps): import("react").JSX.Element;
type TabsProps = {
    readonly tabs: ReadonlyArray<{
        readonly id: string;
        readonly label: string;
        readonly marked?: boolean;
    }>;
    readonly active: string;
};
export declare function Tabs({ tabs, active }: TabsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=Feedback.d.ts.map