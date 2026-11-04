declare const TigrisCredentialsMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.TigrisCredentialsMissing";
} & Readonly<A>;
/**
 * A {@link Bucket}'s Tigris credentials could not be resolved when a
 * bound S3 operation ran.
 *
 * Tigris hands out the access key pair once, at add-on creation. If the
 * Bucket attributes reaching the binding carry no key pair — an adopted
 * bucket, or one whose create-only secrets were never persisted — the
 * operation fails with this instead of signing an anonymous request.
 */
export declare class TigrisCredentialsMissing extends TigrisCredentialsMissing_base<{
    name: string;
}> {
}
export {};
//# sourceMappingURL=Errors.d.ts.map