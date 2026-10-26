export declare const SOURCE_URL = "https://github.com/ShadowWalkerNC/culinaryos-kitchen-tools";
export declare const SPECIALTY_PLAYBOOKS: Record<string, string>;
export declare function clientConfigurations(endpoint: string): {
    'generic.json': string;
    'cursor.json': string;
    'gemini.json': string;
    'claude-code.json': string;
    'codex.toml': string;
    'local.json': string;
};
export declare function cursorInstallLink(endpoint: string): string;
export declare function playbook(zone?: string): string;
//# sourceMappingURL=distribution.d.ts.map