import { getConnectedFlow } from './connected.js';
const escape = (v) => v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export function printableFlowDocument(db, flowId, documentId) {
    const flow = getConnectedFlow(db, flowId), doc = flow.documents.find(d => d.id === documentId);
    if (!doc)
        throw new Error('Document unavailable');
    const latest = [...flow.documents].reverse().find(d => d.kind === doc.kind);
    const superseded = latest?.id !== doc.id;
    return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(doc.title)}</title><style>body{font:17px Arial,sans-serif;max-width:800px;margin:24px auto;padding:16px;color:#111}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}.state{border:2px solid #333;padding:12px}@media print{body{margin:0;padding:0}}</style><h1>${escape(doc.title)}</h1><p class="state">${superseded ? 'SUPERSEDED DOCUMENT — historical revision' : flow.status === 'completed' ? 'Reviewed package' : 'DRAFT — ' + escape(flow.status.replaceAll('_', ' '))}. Workflow revision ${flow.version}. Document created ${escape(doc.createdAt)}.</p><p>Use your browser's Print command to print or save a PDF. Review local operational requirements before use.</p><pre>${escape(doc.body)}</pre><h2>Recorded source revisions</h2><ul>${doc.sourceVersions.map(s => `<li>${escape(s.kind)}: ${escape(s.id)} — ${escape(String(s.version))}</li>`).join('')}</ul></html>`;
}
//# sourceMappingURL=printDocument.js.map