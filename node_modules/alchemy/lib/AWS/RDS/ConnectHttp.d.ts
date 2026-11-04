import type * as Credentials from "@distilled.cloud/aws/Credentials";
import type * as Region from "@distilled.cloud/aws/Region";
import * as Layer from "effect/Layer";
import { Connect } from "./Connect.ts";
export declare const ConnectHttp: Layer.Layer<Connect, never, Credentials.Credentials | import("effect/unstable/http/HttpClient").HttpClient | Region.Region>;
//# sourceMappingURL=ConnectHttp.d.ts.map