import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as HttpMiddleware from "effect/unstable/http/HttpMiddleware";
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import * as Http from "../../Http.js";
export const isFunctionURLEvent = (event) => {
    return event.requestContext?.http?.method !== undefined;
};
/**
 * REST API (v1) AWS_PROXY events have a top-level `httpMethod` and a
 * `requestContext.resourcePath` field. They lack the `requestContext.http.*`
 * shape of Function URL / HTTP API (v2) events.
 */
export const isApiGatewayProxyEvent = (event) => {
    return (typeof event?.httpMethod === "string" &&
        event?.requestContext?.resourcePath !== undefined);
};
/**
 * Application Load Balancer target events carry a `requestContext.elb` marker
 * (the target group ARN) and a top-level `httpMethod` + `path`.
 */
export const isAlbEvent = (event) => {
    return (typeof event?.httpMethod === "string" &&
        event?.requestContext?.elb !== undefined);
};
export const makeFunctionHttpHandler = (handler) => {
    // `HttpMiddleware.tracer` creates the `http.server` root span per request
    // (continuing an incoming `traceparent`), matching the Worker bridge's
    // fetch path. With the default no-op tracer this is free; with a telemetry
    // exporter installed the span is exported when the invocation scope
    // flushes.
    const safeHandler = HttpMiddleware.tracer(Http.safeHttpEffect(handler));
    return (event) => {
        if (isFunctionURLEvent(event)) {
            const webRequest = functionUrlEventToWebRequest(event);
            const request = HttpServerRequest.fromWeb(webRequest).modify({
                url: webRequest.url,
                remoteAddress: Option.some(event.requestContext.http.sourceIp),
            });
            return safeHandler.pipe(Effect.provideService(HttpServerRequest.HttpServerRequest, request), Effect.flatMap(toLambdaFunctionURLResult));
        }
        if (isAlbEvent(event)) {
            const webRequest = albEventToWebRequest(event);
            const request = HttpServerRequest.fromWeb(webRequest).modify({
                url: webRequest.url,
            });
            return safeHandler.pipe(Effect.provideService(HttpServerRequest.HttpServerRequest, request), 
            // The ALB result shape is the API Gateway v1 result shape (statusCode,
            // headers, multiValueHeaders, body, isBase64Encoded); ALB reads
            // whichever of headers/multiValueHeaders matches the target group's
            // multi-value-headers setting.
            Effect.flatMap(toApiGatewayProxyResult));
        }
        if (isApiGatewayProxyEvent(event)) {
            const webRequest = apiGatewayProxyEventToWebRequest(event);
            const request = HttpServerRequest.fromWeb(webRequest).modify({
                url: webRequest.url,
                remoteAddress: Option.fromNullishOr(event.requestContext?.identity?.sourceIp),
            });
            return safeHandler.pipe(Effect.provideService(HttpServerRequest.HttpServerRequest, request), Effect.flatMap(toApiGatewayProxyResult));
        }
    };
};
const functionUrlEventToWebRequest = (event) => {
    // `requestContext.http.protocol` is the HTTP version ("HTTP/1.1"), never a
    // URL scheme — without `x-forwarded-proto` (real Function URLs always set
    // it; local emulators may not) fall back to https.
    const protocol = event.headers["x-forwarded-proto"] ?? "https";
    const host = event.headers.host ?? event.requestContext.domainName;
    const url = `${protocol}://${host}${event.rawPath}${event.rawQueryString ? `?${event.rawQueryString}` : ""}`;
    const method = event.requestContext.http.method;
    const headers = new Headers();
    for (const [key, value] of Object.entries(event.headers)) {
        if (value !== undefined) {
            headers.set(key, value);
        }
    }
    if (event.cookies?.length) {
        headers.set("cookie", event.cookies.join("; "));
    }
    let body;
    if (event.body !== undefined) {
        body = event.isBase64Encoded
            ? Uint8Array.from(atob(event.body), (c) => c.charCodeAt(0)).buffer
            : event.body;
    }
    return new Request(url, {
        method,
        headers,
        body: body && method !== "GET" && method !== "HEAD" ? body : undefined,
    });
};
const albEventToWebRequest = (event) => {
    const headers = new Headers();
    if (event.multiValueHeaders) {
        for (const [key, values] of Object.entries(event.multiValueHeaders)) {
            if (!values)
                continue;
            for (const value of values) {
                if (value !== undefined && value !== null) {
                    headers.append(key, value);
                }
            }
        }
    }
    if (event.headers) {
        for (const [key, value] of Object.entries(event.headers)) {
            if (value !== undefined && value !== null && !headers.has(key)) {
                headers.set(key, value);
            }
        }
    }
    const protocol = headers.get("x-forwarded-proto") ??
        headers.get("X-Forwarded-Proto") ??
        "http";
    const host = headers.get("host") ?? headers.get("Host") ?? "alb";
    // Unlike API Gateway, ALB does NOT URL-decode the path or query-string
    // parameters — they arrive still percent-encoded, so join them verbatim
    // (re-encoding would double-encode).
    const queryParts = [];
    if (event.multiValueQueryStringParameters) {
        for (const [k, vs] of Object.entries(event.multiValueQueryStringParameters)) {
            if (!vs)
                continue;
            for (const v of vs) {
                queryParts.push(`${k}=${v ?? ""}`);
            }
        }
    }
    else if (event.queryStringParameters) {
        for (const [k, v] of Object.entries(event.queryStringParameters)) {
            if (v === undefined || v === null)
                continue;
            queryParts.push(`${k}=${v}`);
        }
    }
    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const url = `${protocol}://${host}${event.path ?? "/"}${queryString}`;
    const method = event.httpMethod;
    let body;
    if (event.body !== null && event.body !== undefined) {
        body = event.isBase64Encoded
            ? Uint8Array.from(atob(event.body), (c) => c.charCodeAt(0)).buffer
            : event.body;
    }
    return new Request(url, {
        method,
        headers,
        body: body && method !== "GET" && method !== "HEAD" ? body : undefined,
    });
};
const apiGatewayProxyEventToWebRequest = (event) => {
    const headers = new Headers();
    if (event.multiValueHeaders) {
        for (const [key, values] of Object.entries(event.multiValueHeaders)) {
            if (!values)
                continue;
            for (const value of values) {
                if (value !== undefined && value !== null) {
                    headers.append(key, value);
                }
            }
        }
    }
    if (event.headers) {
        for (const [key, value] of Object.entries(event.headers)) {
            if (value !== undefined && value !== null && !headers.has(key)) {
                headers.set(key, value);
            }
        }
    }
    const protocol = headers.get("x-forwarded-proto") ??
        headers.get("X-Forwarded-Proto") ??
        "https";
    const host = headers.get("host") ??
        headers.get("Host") ??
        event.requestContext.domainName ??
        "lambda";
    const stage = event.requestContext.stage;
    // API Gateway prefixes paths with the stage when invoked via the default
    // execute-api endpoint; `event.path` already contains that. Use it as-is.
    const path = event.path ?? "/";
    const queryParts = [];
    if (event.multiValueQueryStringParameters) {
        for (const [k, vs] of Object.entries(event.multiValueQueryStringParameters)) {
            if (!vs)
                continue;
            for (const v of vs) {
                queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v ?? "")}`);
            }
        }
    }
    else if (event.queryStringParameters) {
        for (const [k, v] of Object.entries(event.queryStringParameters)) {
            if (v === undefined || v === null)
                continue;
            queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
        }
    }
    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const url = `${protocol}://${host}${path}${queryString}`;
    const method = event.httpMethod;
    let body;
    if (event.body !== null && event.body !== undefined) {
        body = event.isBase64Encoded
            ? Uint8Array.from(atob(event.body), (c) => c.charCodeAt(0)).buffer
            : event.body;
    }
    // Reference `stage` so static analysis sees it as used; the variable is
    // useful when constructing fully-qualified URLs in downstream code.
    void stage;
    return new Request(url, {
        method,
        headers,
        body: body && method !== "GET" && method !== "HEAD" ? body : undefined,
    });
};
const toLambdaFunctionURLResult = (response) => Effect.gen(function* () {
    const context = yield* Effect.context();
    const webResponse = HttpServerResponse.toWeb(response, { context });
    const headers = new Headers(webResponse.headers);
    const cookies = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
    headers.delete("set-cookie");
    if (!webResponse.body) {
        return {
            statusCode: webResponse.status,
            headers: Object.fromEntries(headers.entries()),
            cookies: cookies.length > 0 ? cookies : undefined,
        };
    }
    const bytes = new Uint8Array(yield* Effect.promise(() => webResponse.arrayBuffer()));
    const isTextual = isTextualContentType(headers.get("content-type"));
    const body = bytes.length === 0
        ? undefined
        : isTextual
            ? new TextDecoder().decode(bytes)
            : Buffer.from(bytes).toString("base64");
    return {
        statusCode: webResponse.status,
        headers: Object.fromEntries(headers.entries()),
        body,
        cookies: cookies.length > 0 ? cookies : undefined,
        isBase64Encoded: body !== undefined && !isTextual ? true : undefined,
    };
});
const toApiGatewayProxyResult = (response) => Effect.gen(function* () {
    const context = yield* Effect.context();
    const webResponse = HttpServerResponse.toWeb(response, { context });
    const headers = new Headers(webResponse.headers);
    const multiValueHeaders = {};
    const singleHeaders = {};
    for (const [key, value] of headers.entries()) {
        if (multiValueHeaders[key]) {
            multiValueHeaders[key].push(value);
        }
        else {
            multiValueHeaders[key] = [value];
            singleHeaders[key] = value;
        }
    }
    if (!webResponse.body) {
        return {
            statusCode: webResponse.status,
            headers: singleHeaders,
            multiValueHeaders,
            body: "",
        };
    }
    const bytes = new Uint8Array(yield* Effect.promise(() => webResponse.arrayBuffer()));
    const isTextual = isTextualContentType(headers.get("content-type"));
    const isBase64 = bytes.length > 0 && !isTextual;
    const body = bytes.length === 0
        ? ""
        : isTextual
            ? new TextDecoder().decode(bytes)
            : Buffer.from(bytes).toString("base64");
    return {
        statusCode: webResponse.status,
        headers: singleHeaders,
        multiValueHeaders,
        body,
        isBase64Encoded: isBase64,
    };
});
const isTextualContentType = (contentType) => {
    if (!contentType) {
        return false;
    }
    const normalized = contentType.toLowerCase();
    return (normalized.startsWith("text/") ||
        normalized.includes("json") ||
        normalized.includes("xml") ||
        normalized.includes("javascript") ||
        normalized.includes("form-urlencoded"));
};
//# sourceMappingURL=HttpServer.js.map