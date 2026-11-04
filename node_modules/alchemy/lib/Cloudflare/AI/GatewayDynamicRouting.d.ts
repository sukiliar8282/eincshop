import * as aiGateway from "@distilled.cloud/cloudflare/ai-gateway";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.AI.DynamicRouting";
type TypeId = typeof TypeId;
/**
 * Reference to another element in the route graph.
 */
export type RouteEdge = {
    /**
     * The `id` of the element the edge points at.
     */
    elementId: string;
};
/**
 * Entry point of the route graph. Every route has exactly one.
 */
export type RouteStartElement = {
    /**
     * Unique element identifier within the route graph.
     */
    id: string;
    type: "start";
    /**
     * The element executed first.
     */
    outputs: {
        next: RouteEdge;
    };
};
/**
 * Branches the request based on conditions over request metadata.
 */
export type RouteConditionalElement = {
    /**
     * Unique element identifier within the route graph.
     */
    id: string;
    type: "conditional";
    /**
     * Conditions evaluated against the request.
     */
    properties: {
        conditions?: unknown;
    };
    /**
     * Edges taken when the conditions evaluate true / false.
     */
    outputs: {
        true: RouteEdge;
        false: RouteEdge;
    };
};
/**
 * Splits traffic across multiple edges by percentage.
 */
export type RoutePercentageElement = {
    /**
     * Unique element identifier within the route graph.
     */
    id: string;
    type: "percentage";
    /**
     * Percentage-weighted edges.
     */
    outputs: Record<string, unknown>;
};
/**
 * Applies a rate limit; requests over the limit take the fallback edge.
 */
export type RouteRateElement = {
    /**
     * Unique element identifier within the route graph.
     */
    id: string;
    type: "rate";
    properties: {
        /**
         * Key the limit is bucketed by.
         */
        key: string;
        /**
         * Maximum count/cost allowed inside the window.
         */
        limit: number;
        /**
         * Whether the limit counts requests or cost.
         */
        limitType: "count" | "cost";
        /**
         * Window size in seconds.
         */
        window: number;
    };
    /**
     * Edges taken when under (success) or over (fallback) the limit.
     */
    outputs: {
        success: RouteEdge;
        fallback: RouteEdge;
    };
};
/**
 * Sends the request to a provider/model; failures take the fallback edge.
 */
export type RouteModelElement = {
    /**
     * Unique element identifier within the route graph.
     */
    id: string;
    type: "model";
    properties: {
        /**
         * Provider slug (e.g. `workers-ai`, `openai`, `anthropic`).
         */
        provider: string;
        /**
         * Model identifier (e.g. `@cf/meta/llama-3.1-8b-instruct`).
         */
        model: string;
        /**
         * Number of retries before taking the fallback edge.
         */
        retries: number;
        /**
         * Request timeout in milliseconds.
         */
        timeout: number;
    };
    /**
     * Edges taken on success / failure.
     */
    outputs: {
        success: RouteEdge;
        fallback: RouteEdge;
    };
};
/**
 * Terminal element of the route graph.
 */
export type RouteEndElement = {
    /**
     * Unique element identifier within the route graph.
     */
    id: string;
    type: "end";
    /**
     * Always empty.
     */
    outputs: Record<string, never>;
};
/**
 * A node in an AI Gateway dynamic routing graph. A well-formed graph starts
 * at a `start` element and every path terminates at an `end` element.
 */
export type RouteElement = RouteStartElement | RouteConditionalElement | RoutePercentageElement | RouteRateElement | RouteModelElement | RouteEndElement;
export type GatewayDynamicRoutingProps = {
    /**
     * The AI Gateway the route belongs to. Changing the gateway triggers a
     * replacement.
     */
    gatewayId: string;
    /**
     * Route name, unique within the gateway. If omitted, a unique name is
     * generated from the app, stage, and logical ID. Renames are applied in
     * place.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The element graph describing how requests are routed. Changing the
     * graph creates a new route version and deploys it.
     */
    elements: RouteElement[];
};
export type GatewayDynamicRoutingAttributes = {
    /**
     * Server-generated route identifier. Stable across updates.
     */
    routeId: string;
    /**
     * The Cloudflare account the route belongs to.
     */
    accountId: string;
    /**
     * The AI Gateway the route belongs to.
     */
    gatewayId: string;
    /**
     * Route name.
     */
    name: string;
    /**
     * The element graph of the currently deployed route version.
     */
    elements: RouteElement[];
    /**
     * Identifier of the currently deployed route version.
     */
    versionId: string;
    /**
     * Identifier of the active deployment.
     */
    deploymentId: string;
    /**
     * When the route was created.
     */
    createdAt: string;
    /**
     * When the route was last modified.
     */
    modifiedAt: string;
};
export type GatewayDynamicRouting = Resource<TypeId, GatewayDynamicRoutingProps, GatewayDynamicRoutingAttributes, never, Providers>;
/**
 * A dynamic routing configuration ("route") on a Cloudflare.AI. Gateway.
 *
 * Dynamic routing models request handling as a graph of elements — start,
 * conditional, percentage split, rate limit, model, and end nodes — so a
 * single gateway endpoint can A/B test models, enforce per-user budgets, and
 * fall back between providers without app changes.
 *
 * Cloudflare versions route configurations: changing `elements` creates a
 * new version and deploys it; the reconciler also re-deploys when the live
 * deployed version drifts from the desired graph. Renames are applied in
 * place; only moving the route to a different gateway forces a replacement.
 * ### Creating a Route
 * **Example:** Route all traffic to one model
 * ```typescript
 * const gateway = yield* Cloudflare.AI.Gateway("Gateway");
 *
 * const route = yield* Cloudflare.AI.GatewayDynamicRouting("Llama", {
 *   gatewayId: gateway.gatewayId,
 *   elements: [
 *     { id: "start", type: "start", outputs: { next: { elementId: "model" } } },
 *     {
 *       id: "model",
 *       type: "model",
 *       properties: {
 *         provider: "workers-ai",
 *         model: "@cf/meta/llama-3.1-8b-instruct",
 *         retries: 1,
 *         timeout: 30000,
 *       },
 *       outputs: {
 *         success: { elementId: "end" },
 *         fallback: { elementId: "end" },
 *       },
 *     },
 *     { id: "end", type: "end", outputs: {} },
 *   ],
 * });
 * ```
 *
 * ### Updating a Route
 * **Example:** Change the model — creates and deploys a new version
 * ```typescript
 * const route = yield* Cloudflare.AI.GatewayDynamicRouting("Llama", {
 *   gatewayId: gateway.gatewayId,
 *   elements: [
 *     { id: "start", type: "start", outputs: { next: { elementId: "model" } } },
 *     {
 *       id: "model",
 *       type: "model",
 *       properties: {
 *         provider: "workers-ai",
 *         model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
 *         retries: 2,
 *         timeout: 60000,
 *       },
 *       outputs: {
 *         success: { elementId: "end" },
 *         fallback: { elementId: "end" },
 *       },
 *     },
 *     { id: "end", type: "end", outputs: {} },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/
 *
 * @resource
 * @product AI Gateway
 * @category AI
 */
export declare const GatewayDynamicRouting: import("../../Resource.ts").ResourceClass<GatewayDynamicRouting>;
/**
 * Returns true if the given value is a GatewayDynamicRouting resource.
 */
export declare const isDynamicRouting: (value: unknown) => value is GatewayDynamicRouting;
export declare const DynamicRoutingProvider: () => import("effect/Layer").Layer<Provider.Provider<GatewayDynamicRouting>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | aiGateway.CloudflareOpContext>;
export {};
//# sourceMappingURL=GatewayDynamicRouting.d.ts.map