import * as DynamoDB from "@distilled.cloud/aws/dynamodb";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.ts";
import type { Table } from "./Table.ts";
export type BatchExecuteStatementTables = [Table, ...Table[]];
export declare const sortBatchExecuteStatementTables: (tables: BatchExecuteStatementTables) => BatchExecuteStatementTables;
export interface BatchExecuteStatementRequest extends DynamoDB.BatchExecuteStatementInput {
}
/**
 * Runtime binding for DynamoDB PartiQL `BatchExecuteStatement`.
 *
 * The request is passed through unchanged, but IAM is scoped to the explicitly
 * bound tables and their indexes.
 * ### PartiQL
 * **Example:** Execute a Batch of Statements
 * ```typescript
 * const batchExecuteStatement = yield* AWS.DynamoDB.BatchExecuteStatement(
 *   sourceTable,
 *   archiveTable,
 * );
 *
 * const response = yield* batchExecuteStatement({
 *   Statements: [
 *     {
 *       Statement: `SELECT * FROM "${yield* sourceTable.tableName}" WHERE pk=?`,
 *       Parameters: [{ S: "user#1" }],
 *     },
 *   ],
 * });
 * ```
 *
 * @binding
 */
export interface BatchExecuteStatement extends Binding.Service<BatchExecuteStatement, "AWS.DynamoDB.BatchExecuteStatement", (...tables: BatchExecuteStatementTables) => Effect.Effect<(request: BatchExecuteStatementRequest) => Effect.Effect<DynamoDB.BatchExecuteStatementOutput, DynamoDB.BatchExecuteStatementError>>> {
}
export declare const BatchExecuteStatement: BatchExecuteStatement;
//# sourceMappingURL=BatchExecuteStatement.d.ts.map