// Original text-only report structures. No records, observations or actions are generated.
export const REPORT_HEADINGS = {
    'Receiving discrepancy': 'receiving-discrepancy',
    'Manager closing report': 'manager-closing-report',
    'Stock and waste review': 'stock-waste-review',
    'Training and shift handover': 'training-handover',
    'Campaign review': 'campaign-review',
    'Home cooking plan': 'home-cooking-plan',
    'Specialist handoff': 'specialist-handoff',
};
export function reportTemplates(markdown) {
    const parts = markdown.split(/^## /m).slice(1), result = {};
    for (const part of parts) {
        const end = part.indexOf('\n'), heading = part.slice(0, end).trim();
        const slug = REPORT_HEADINGS[heading];
        if (!slug)
            throw Error('Unknown report template heading: ' + heading);
        if (result[slug])
            throw Error('Duplicate report template: ' + heading);
        const body = part.slice(end + 1).trim();
        if (body.length < 30)
            throw Error('Empty report template: ' + heading);
        result[slug] = '# ' + heading + '\n\nStatus: draft; not submitted. This is a blank boilerplate, not an official completed record.\nSource references and revisions: [supplied]\nPrepared by: [blank until supplied]\nReviewed by / signature: [blank until supplied]\nCurrency, units, site and timezone: [supply only when material]\n\n' + body + '\n';
    }
    if (Object.keys(result).length !== Object.keys(REPORT_HEADINGS).length)
        throw Error('Expected seven report boilerplates');
    return result;
}
//# sourceMappingURL=templates.js.map