# Flows — Kitchen Tools

## F10 Import preview → commit
```mermaid
sequenceDiagram
  participant U as Operator
  participant API as Local API/MCP
  participant DB as SQLite
  U->>API: preview_import(payload, kind)
  API->>API: validate (F05) + diff vs current
  API->>DB: store preview (payload, expectedVersions, expires)
  API-->>U: preview token + missing/conflicts
  U->>API: commit_import(token, confirm:true)
  API->>DB: BEGIN; check versions; insert; COMMIT
  DB-->>API: ok / STALE_VERSION
  API-->>U: committed versions or 409
```

## F06 Costing
```mermaid
flowchart TD
  A[Recipe + Purchases] --> B{Validate graph}
  B -- cycle/invalid --> E[Error, no partial cost]
  B -- ok --> C[Resolve known vs unknown]
  C --> D[Result knownCents + unknown list + coverage]
  D --> F{Confirmed variant price?}
  F -- yes --> G[Add marginCents]
  F -- no --> H[No margin]
```

## F12 Daily prep job
```mermaid
flowchart TD
  S[Scheduler tick tz cutoff] --> L{Acquire lease occurrence}
  L -- lost --> Z[Skip, another worker]
  L -- won --> R[Load approved recipes + forecast/stock]
  R --> M{Missing data?}
  M -- yes --> T[Action-required task]
  M -- no --> P[Prep draft + run history]
```

## F14 Local session
```mermaid
sequenceDiagram
  participant B as Browser UI
  participant S as Local server
  B->>S: GET /api/session (Origin + Sec-Fetch-Site checked)
  S-->>B: session token
  B->>S: POST /api/* with X-Session-Token
  S->>S: verify token + host/origin + size
  S-->>B: result
```
