/**
 * Convert a {@link LakeFormationResourceSpec} to the wire `Resource` union
 * shape expected by the Lake Formation API.
 */
export const toWireResource = (spec) => {
    const resource = {};
    if (spec.catalog !== undefined) {
        resource.Catalog = { Id: spec.catalog.id };
    }
    if (spec.database !== undefined) {
        resource.Database = {
            CatalogId: spec.database.catalogId,
            Name: spec.database.name,
        };
    }
    if (spec.table !== undefined) {
        resource.Table = {
            CatalogId: spec.table.catalogId,
            DatabaseName: spec.table.databaseName,
            Name: spec.table.name,
            TableWildcard: spec.table.tableWildcard ? {} : undefined,
        };
    }
    if (spec.tableWithColumns !== undefined) {
        resource.TableWithColumns = {
            CatalogId: spec.tableWithColumns.catalogId,
            DatabaseName: spec.tableWithColumns.databaseName,
            Name: spec.tableWithColumns.name,
            ColumnNames: spec.tableWithColumns.columnNames,
            ColumnWildcard: spec.tableWithColumns.excludedColumnNames !== undefined
                ? { ExcludedColumnNames: spec.tableWithColumns.excludedColumnNames }
                : undefined,
        };
    }
    if (spec.dataLocation !== undefined) {
        resource.DataLocation = {
            CatalogId: spec.dataLocation.catalogId,
            ResourceArn: spec.dataLocation.resourceArn,
        };
    }
    if (spec.lfTag !== undefined) {
        resource.LFTag = {
            CatalogId: spec.lfTag.catalogId,
            TagKey: spec.lfTag.tagKey,
            TagValues: spec.lfTag.tagValues,
        };
    }
    if (spec.lfTagPolicy !== undefined) {
        resource.LFTagPolicy = {
            CatalogId: spec.lfTagPolicy.catalogId,
            ResourceType: spec.lfTagPolicy.resourceType,
            Expression: spec.lfTagPolicy.expression.map((e) => ({
                TagKey: e.tagKey,
                TagValues: e.tagValues,
            })),
        };
    }
    return resource;
};
//# sourceMappingURL=ResourceSpec.js.map