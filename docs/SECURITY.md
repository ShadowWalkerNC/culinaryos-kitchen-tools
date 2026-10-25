# Security and data handling

- Local server binds 127.0.0.1 only. Mutations require a per-boot session secret (0600 file in workspace + memory); issuance endpoint is exact same-origin with Origin + Sec-Fetch-Site validation.
- Strict Host allowlist (127.0.0.1 / localhost + port). No wildcard CORS headers are emitted. No tunnels.
- Request bodies capped at 1MB. Public HTTP admission has concurrency 4 with no unbounded queue. Async calls have a 5s deadline. Synchronous CPU work is bounded by input/quantity size and recipe expansion/depth limits; the deadline is not CPU preemption.
- Logs are metadata-only (method/path/status/duration). No payloads, tokens, or secrets logged.
- Public mode is stateless: no DB, no secrets, no file access, no persisted payloads, no model calls.
- Approvals bind exact object/version; stale decisions fail. Browser `verified` flags are never trusted.
- Exports/backup reject traversal and symlink/junction ancestors, and refuse overwriting existing destinations. SQLite backups use VACUUM INTO to include committed WAL data.
- No credentials ship in the product or public package. Live integration NOT RUN.
