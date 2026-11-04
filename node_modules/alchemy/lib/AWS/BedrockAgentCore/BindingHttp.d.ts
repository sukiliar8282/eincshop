import * as Effect from "effect/Effect";
import type * as Output from "../../Output.ts";
import type { BrowserCustom } from "./BrowserCustom.ts";
import type { CodeInterpreter } from "./CodeInterpreter.ts";
import type { Memory } from "./Memory.ts";
import type { Runtime } from "./Runtime.ts";
/**
 * Shared scaffolding for Bedrock AgentCore data-plane HTTP bindings.
 *
 * NOT exported from `index.ts` — every single-operation `{Op}Http.ts` in this
 * service is a thin `Layer.effect(Cap, makeAgentCoreHttpBinding({ … }))` over
 * the builder below. Everything except the operation, the IAM action list,
 * the injected identifier, and the granted ARNs is boilerplate: the runtime
 * callable injects the bound resource's identifier (memory id, code
 * interpreter id, browser id, or agent runtime ARN) as `requestKey`, and the
 * deploy-time half grants `actions` on `arns`.
 *
 * Genuinely-different bindings (custom request shaping like the
 * `sessionTimeout` duration conversion in `StartCodeInterpreterSession` /
 * `StartBrowserSession`) stay bespoke.
 */
/** The AgentCore resources data-plane bindings can scope to. */
export type AgentCoreBindable = Memory | CodeInterpreter | BrowserCustom | Runtime;
/**
 * Build the impl Effect for a single-operation AgentCore data-plane binding.
 * The runtime callable injects the resolved `identifier` as the request's
 * `requestKey` field; the deploy-time half grants `actions` on `arns`.
 */
export declare const makeAgentCoreHttpBinding: <Res extends AgentCoreBindable, I extends object, K extends keyof I & string, A, E, R, IdReq = never>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.BedrockAgentCore.GetEvent`. */
    tag: string;
    /** The distilled operation; `requestKey` is injected from the resource. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `arns`. */
    actions: readonly string[];
    /** The request field the resolved identifier is injected as. */
    requestKey: K;
    /** Resolve the injected identifier from the bound resource. */
    identifier: (resource: Res) => Output.Output<string, IdReq>;
    /** IAM resource ARNs granted `actions`. */
    arns: (resource: Res) => readonly Output.Output<string>[];
}) => Effect.Effect<(resource: Res) => Effect.Effect<(request?: Omit<I, K> | undefined) => Effect.Effect<A, E, never>, never, IdReq>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map