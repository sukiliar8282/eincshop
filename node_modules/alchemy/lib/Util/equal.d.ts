/**
 * Shallow, order-sensitive array equality. `undefined`-tolerant: two
 * `undefined`s are equal, an `undefined` and an array are not.
 *
 * Pass a custom `eq` comparator for non-primitive elements, e.g.
 * `(x, y) => JSON.stringify(x) === JSON.stringify(y)`.
 */
export declare const arrayEquals: <T>(a: ReadonlyArray<T> | undefined, b: ReadonlyArray<T> | undefined, eq?: (x: T, y: T) => boolean) => boolean;
/**
 * Order-insensitive array equality for primitive elements (compares
 * sorted copies). `undefined`-tolerant like {@link arrayEquals}.
 */
export declare const arrayEqualsUnordered: <T extends string | number>(a: ReadonlyArray<T> | undefined, b: ReadonlyArray<T> | undefined) => boolean;
/**
 * Shallow equality of two string records (same keys, same values).
 */
export declare const recordsEqual: (a: Record<string, string>, b: Record<string, string>) => boolean;
//# sourceMappingURL=equal.d.ts.map