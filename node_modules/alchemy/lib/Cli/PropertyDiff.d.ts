export type YamlDisplayValue = string | number | boolean | null | YamlDisplayValue[] | {
    readonly [key: string]: YamlDisplayValue;
};
export interface DeclaredPropertyYaml {
    readonly kind: "create" | "change" | "drift";
    readonly lines: ReadonlyArray<string>;
}
export interface YamlChangeMatch {
    readonly marker: "-" | "+";
    readonly content: string;
}
/** Match a `- `/`+ ` change marker emitted by {@link unifiedDriftLines}. */
export declare const matchYamlChange: (line: string) => YamlChangeMatch | undefined;
export interface YamlKeyMatch {
    readonly indent: string;
    /** The key including its trailing colon. */
    readonly key: string;
    readonly value: string;
}
/** Match an `indent` + `key:` + rest display-YAML line for colorizing. */
export declare const matchYamlKey: (line: string) => YamlKeyMatch | undefined;
/** Format the changed cloud attributes carried by a drift-repair plan. */
export declare const formatDriftPropertyYaml: (expected: unknown, actual: unknown, missing?: boolean) => DeclaredPropertyYaml;
/**
 * Turn arbitrary declared inputs or persisted state into safe, deterministic
 * plain data for terminal display. Deferred values are described, never run,
 * and Redacted values are replaced before their contents can reach YAML.
 */
export declare const toYamlDisplayValue: (value: unknown, ancestors?: WeakSet<object>) => YamlDisplayValue;
/** Format a value as stable, unadorned YAML lines for terminal renderers. */
export declare const formatYamlLines: (value: unknown) => string[];
/**
 * Build the detailed property document for a plan resource. This compares
 * persisted declared props to desired declared props; it is not cloud drift.
 */
export declare const formatDeclaredPropertyYaml: (oldProps: unknown, newProps: unknown, action: "create" | "update" | "replace") => DeclaredPropertyYaml | undefined;
//# sourceMappingURL=PropertyDiff.d.ts.map