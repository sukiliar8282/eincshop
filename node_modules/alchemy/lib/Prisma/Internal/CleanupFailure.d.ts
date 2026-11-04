/**
 * Preserve both the reconcile failure and a subsequent cleanup failure.
 *
 * Cleanup failures are operationally important: suppressing one can leave an
 * untracked cloud resource behind with no indication of how to remove it.
 */
export declare const aggregateCleanupFailure: (resource: "App" | "deployment", resourceId: string, route: string, originalError: unknown, cleanupError: unknown) => AggregateError;
//# sourceMappingURL=CleanupFailure.d.ts.map