import { ListOperations } from "./ListOperations.ts";
/**
 * HTTP implementation of the {@link ListOperations} binding. Calls
 * `apprunner:ListOperations` with the Lambda's IAM role, scoped to the
 * bound service.
 */
export declare const ListOperationsHttp: import("effect/Layer").Layer<ListOperations, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ListOperationsHttp.d.ts.map