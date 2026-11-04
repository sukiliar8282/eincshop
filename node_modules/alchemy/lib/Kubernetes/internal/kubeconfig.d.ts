import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
declare const KubeConfigError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Kubernetes.KubeConfigError";
} & Readonly<A>;
/** A kubeconfig file could not be read, parsed, or resolved. */
export declare class KubeConfigError extends KubeConfigError_base<{
    readonly message: string;
    readonly cause?: unknown;
}> {
}
declare const ExecCredentialError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Kubernetes.ExecCredentialError";
} & Readonly<A>;
/** An exec credential plugin invocation failed or answered malformed. */
export declare class ExecCredentialError extends ExecCredentialError_base<{
    readonly message: string;
    readonly cause?: unknown;
}> {
}
interface KubeConfigUser {
    token?: string;
    tokenFile?: string;
    "client-certificate"?: string;
    "client-certificate-data"?: string;
    "client-key"?: string;
    "client-key-data"?: string;
    exec?: {
        command?: string;
        args?: string[];
        env?: {
            name?: string;
            value?: string;
        }[];
        apiVersion?: string;
    };
}
/** The resolved connection material for one kubeconfig context. */
export interface ResolvedKubeContext {
    endpoint: string;
    certificateAuthorityData?: string;
    insecureSkipTlsVerify?: boolean;
    user: KubeConfigUser;
}
/** Resolve the kubeconfig file path: explicit → `$KUBECONFIG` → default. */
export declare const resolveKubeConfigPath: (explicit: string | undefined) => Effect.Effect<string, KubeConfigError, Path.Path>;
/** Load a kubeconfig file and resolve one context to its cluster + user. */
export declare const resolveKubeContext: (options: {
    path?: string;
    context?: string;
}) => Effect.Effect<{
    endpoint: string;
    certificateAuthorityData: string | undefined;
    insecureSkipTlsVerify: boolean | undefined;
    user: KubeConfigUser;
}, KubeConfigError, FileSystem.FileSystem | Path.Path>;
/** Credentials minted by a user's auth stanza for one request. */
export interface MintedCredentials {
    token?: string;
    clientCert?: {
        certificate: string;
        key: string;
    };
}
/**
 * Run a kubeconfig-style exec credential plugin and parse its
 * ExecCredential response.
 */
export declare const runExecCredential: (options: {
    command: string;
    args?: string[] | undefined;
    env?: Record<string, string> | undefined;
}) => Effect.Effect<MintedCredentials, ExecCredentialError, ChildProcessSpawner.ChildProcessSpawner>;
/** Mint request credentials from a kubeconfig user's auth stanza. */
export declare const mintUserCredentials: (user: KubeConfigUser) => Effect.Effect<MintedCredentials | {
    clientCert: {
        certificate: any;
        key: any;
    };
}, ExecCredentialError | KubeConfigError, ChildProcessSpawner.ChildProcessSpawner | FileSystem.FileSystem | Path.Path>;
export {};
//# sourceMappingURL=kubeconfig.d.ts.map