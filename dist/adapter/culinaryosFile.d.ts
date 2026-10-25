export interface AdapterResult {
    tenantId: string;
    recipes: unknown[];
    purchases: unknown[];
}
/**
 * Read a JSON export file previously copied by the operator into the workspace.
 * Requires explicit workspace/tenant binding + confirmation. Rejects traversal and cross-tenant files.
 */
export declare function readExportFile(workspaceRoot: string, tenantId: string, fileName: string, confirm: boolean): AdapterResult;
//# sourceMappingURL=culinaryosFile.d.ts.map