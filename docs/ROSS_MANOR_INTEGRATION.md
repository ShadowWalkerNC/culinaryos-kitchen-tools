# Chef's Intelligence and care-facility paperwork

Open Kitchen Toolkit is the general kitchen/restaurant layer. The existing Ross Manor Paperwork plugin (`sylvia-ross-menu-processor`) remains an optional specialist for privacy-reviewed weekly menus, readiness, approved paperwork and explicit aggregate count workflows. This release adds routing instructions, not a second renderer or a hosted copy of that private workspace.

Use both installed plugins in a supported local client. Start with: “Use Open Kitchen Toolkit to help me review this care-facility menu, then use Ross Manor Paperwork for the approved packet. Show each review step.” Confirm the source is suitable to share before attaching it. Use de-identified counts and the facility's approved diet specifications; do not upload resident-identifying or clinical records to the public toolkit.

The handoff is planning → privacy-reviewed specialist import → readiness/corrections → approval of the current source revision → an explicitly requested packet. The current specialist skill and tools determine actual allowed operations, packet options and output. Tools unavailable means a blocked handoff or manual draft, not a claimed PDF or saved task. Existing menu approvals do not approve a changed menu or certify clinical suitability.

The specialist currently uses a local server and its own explicitly selected data store. Its maintained project supplies its installation package; this public repository does not redistribute facility source photos, menu records, counts or installation state. Remote ChatGPT access to the public kitchen server does not provide access to the local specialist server. A shared hosted facility service is separate work requiring a concrete private access design.
