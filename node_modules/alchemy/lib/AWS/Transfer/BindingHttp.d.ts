import * as Effect from "effect/Effect";
import * as Output from "../../Output.ts";
import type { Server } from "./Server.ts";
import type { User } from "./User.ts";
/**
 * Shared scaffolding for the AWS Transfer Family runtime bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeTransfer…HttpBinding({ … }))` over one of the
 * three builders below. Everything except the operation, the IAM action
 * list, and the injected identifier(s) is boilerplate.
 */
/**
 * Build the impl Effect for a server-scoped Transfer operation: the runtime
 * callable injects the bound {@link Server}'s ID as `ServerId` and the
 * deploy-time half grants `actions` on the server's ARN.
 */
export declare const makeTransferServerHttpBinding: <I extends {
    ServerId?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Transfer.StartServer`. */
    tag: string;
    /** The distilled operation; `ServerId` is injected from the server. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the server ARN. */
    actions: readonly string[];
    /**
     * Override the IAM resource derived from the server. Most server-scoped
     * operations authorize against the server ARN; a few operations use a
     * related resource type instead (for example, TestIdentityProvider uses a
     * user ARN even though ServerId is the injected request identifier).
     */
    resource?: (server: Server) => string | Output.Output<string>;
}) => Effect.Effect<(server: Server) => Effect.Effect<(request?: Omit<I, "ServerId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a user-scoped Transfer operation: the runtime
 * callable injects the bound {@link User}'s `ServerId` + `UserName` and the
 * deploy-time half grants `actions` on the user's ARN
 * (`arn:…:user/{serverId}/{userName}`).
 */
export declare const makeTransferUserHttpBinding: <I extends {
    ServerId?: string;
    UserName?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Transfer.ImportSshPublicKey`. */
    tag: string;
    /** The distilled operation; `ServerId` + `UserName` are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the user ARN. */
    actions: readonly string[];
}) => Effect.Effect<(user: User) => Effect.Effect<(request?: Omit<I, "ServerId" | "UserName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level Transfer operation (no
 * resource argument): the deploy-time half grants `actions` on `*`. Used
 * for operations that authorize against ARNs unknowable at deploy time
 * (e.g. `SendWorkflowStepState` authorizes on the workflow's own ARN, and
 * the workflow/execution ids arrive at runtime inside the step event).
 */
export declare const makeTransferAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Transfer.SendWorkflowStepState`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map