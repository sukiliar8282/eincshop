import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/** An Amazon S3 location (bucket + optional key prefix). */
export interface S3Location {
    /** The S3 bucket name. */
    bucket: string;
    /** The object key (or key prefix) within the bucket. */
    key?: string;
    /** The account ID of the bucket owner (for cross-account buckets). */
    bucketOwner?: string;
}
/** Where DataBrew reads the dataset's data from. Exactly one definition. */
export interface DatasetInput {
    /** Read directly from Amazon S3. */
    s3InputDefinition?: S3Location;
    /** Read from an AWS Glue Data Catalog table. */
    dataCatalogInputDefinition?: {
        /** The Data Catalog ID (defaults to the caller's account). */
        catalogId?: string;
        /** The Glue database name. */
        databaseName: string;
        /** The Glue table name. */
        tableName: string;
        /** S3 temp directory for intermediate results. */
        tempDirectory?: S3Location;
    };
    /** Read from a JDBC database through a Glue connection. */
    databaseInputDefinition?: {
        /** The Glue connection name. */
        glueConnectionName: string;
        /** The database table to read. Mutually exclusive with `queryString`. */
        databaseTableName?: string;
        /** S3 temp directory for intermediate results. */
        tempDirectory?: S3Location;
        /** A custom SQL query to select the data. */
        queryString?: string;
    };
}
/** Format-specific parsing options. */
export interface DatasetFormatOptions {
    /** JSON parsing options. */
    json?: {
        /** Whether the file contains multi-line JSON records. */
        multiLine?: boolean;
    };
    /** Excel parsing options. */
    excel?: {
        /** Sheet names to include (max 1). */
        sheetNames?: string[];
        /** Zero-based sheet indexes to include (max 1). */
        sheetIndexes?: number[];
        /** Whether the first row is a header. @default true */
        headerRow?: boolean;
    };
    /** CSV parsing options. */
    csv?: {
        /** The single-character field delimiter. @default "," */
        delimiter?: string;
        /** Whether the first row is a header. @default true */
        headerRow?: boolean;
    };
}
/** A filter expression with substitution variables, e.g. `relative_before :dateParam`. */
export interface FilterExpression {
    /** The expression, e.g. `ends_with :suffix`. */
    expression: string;
    /** Variable substitutions keyed by `:name`. */
    valuesMap: Record<string, string>;
}
/** Options that shape how S3 path parameters select matching files. */
export interface DatasetPathOptions {
    /** Only include files last modified within this condition. */
    lastModifiedDateCondition?: FilterExpression;
    /** Cap the number of matched files. */
    filesLimit?: {
        /** Maximum number of files to include. */
        maxFiles: number;
        /** Ordering attribute. @default "LAST_MODIFIED_DATE" */
        orderedBy?: "LAST_MODIFIED_DATE" | (string & {});
        /** Sort direction. @default "DESCENDING" */
        order?: "DESCENDING" | "ASCENDING" | (string & {});
    };
    /** Path parameter definitions keyed by parameter name. */
    parameters?: Record<string, {
        /** The parameter name (must match the key). */
        name: string;
        /** The parameter type. */
        type: "Datetime" | "Number" | "String" | (string & {});
        /** Datetime parsing options (required for `Datetime`). */
        datetimeOptions?: {
            /** The datetime format, e.g. `yyyy-MM-dd`. */
            format: string;
            /** Timezone offset, e.g. `Z` or `+02:00`. */
            timezoneOffset?: string;
            /** Locale code for month/day names. */
            localeCode?: string;
        };
        /** Whether to add a column holding the parameter value. */
        createColumn?: boolean;
        /** Filter which parameter values match. */
        filter?: FilterExpression;
    }>;
}
export interface DatasetProps {
    /**
     * Name of the dataset. If omitted, a unique name is generated. Changing
     * the name replaces the dataset.
     * @default a generated physical name
     */
    datasetName?: string;
    /**
     * The file format of the source data: `CSV`, `JSON`, `PARQUET`, `EXCEL`,
     * or `ORC`.
     */
    format?: "CSV" | "JSON" | "PARQUET" | "EXCEL" | "ORC" | (string & {});
    /**
     * Format-specific parsing options (CSV delimiter, JSON multi-line, Excel
     * sheets).
     */
    formatOptions?: DatasetFormatOptions;
    /**
     * Where the data lives — S3, a Glue Data Catalog table, or a JDBC
     * database.
     */
    input: DatasetInput;
    /**
     * Path options for dynamic S3 datasets (parameterized paths, file limits).
     */
    pathOptions?: DatasetPathOptions;
    /**
     * Tags to apply to the dataset. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Dataset extends Resource<"AWS.DataBrew.Dataset", DatasetProps, {
    /** Name of the dataset. */
    datasetName: string;
    /** ARN of the dataset. */
    datasetArn: string;
}, {}, Providers> {
}
/**
 * An AWS Glue DataBrew dataset — a pointer to source data (S3 file/prefix,
 * Glue Data Catalog table, or JDBC query) plus parsing options. The dataset
 * definition itself stores no data and is free; it is consumed by DataBrew
 * projects and jobs.
 * ### Creating Datasets
 * **Example:** CSV Dataset from S3
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const dataset = yield* AWS.DataBrew.Dataset("Sales", {
 *   format: "CSV",
 *   formatOptions: { csv: { delimiter: ",", headerRow: true } },
 *   input: {
 *     s3InputDefinition: {
 *       bucket: bucket.bucketName,
 *       key: "raw/sales.csv",
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** JSON Dataset
 * ```typescript
 * const dataset = yield* AWS.DataBrew.Dataset("Events", {
 *   format: "JSON",
 *   formatOptions: { json: { multiLine: false } },
 *   input: {
 *     s3InputDefinition: { bucket: bucket.bucketName, key: "events/" },
 *   },
 * });
 * ```
 *
 * ### Glue Data Catalog
 * **Example:** Dataset from a Catalog Table
 * ```typescript
 * const dataset = yield* AWS.DataBrew.Dataset("Curated", {
 *   input: {
 *     dataCatalogInputDefinition: {
 *       databaseName: glueDatabase.databaseName,
 *       tableName: "curated_sales",
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Dataset: import("../../Resource.ts").ResourceClass<Dataset>;
export declare const buildS3Location: (location: S3Location) => {
    Bucket: string;
    Key: string | undefined;
    BucketOwner: string | undefined;
};
export declare const DatasetProvider: () => import("effect/Layer").Layer<Provider.Provider<Dataset>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Dataset.d.ts.map