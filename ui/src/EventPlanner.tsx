import React, { useEffect, useState } from 'react';
import { api } from './api';

export type AllergenStatus = 'unknown' | 'contains' | 'may_contain' | 'verified_absent';
export type EventCost = { label: string; amount: string };
export type EventResource = { id: string; capacity: string; unit: string };
export type EventTask = { id: string; resourceId: string; start: string; end: string; units: string; unit: string };
export type EventGuest = {
  id: string;
  requirements: string;
  allergenStatus: AllergenStatus;
  source: string;
  sourceVersion: string;
  reviewer: string;
};
export type {EventDraft} from '../../src/workflows/eventDraftTypes';
import type {EventDraft} from '../../src/workflows/eventDraftTypes';

export type EventPlannerProps = { onCreated: () => void };

type DraftResponse = { version: number; payload: EventDraft | null };
type PreviewResponse = { request: unknown; blockers: string[]; summary: unknown };
type CreatedFlow = { id: string; status: string; output: { blockers: string[] } };

function defaultDraft(): EventDraft {
  return {
    currency: '',
    revenue: '',
    totalGuests: '',
    costs: [{ label: '', amount: '' }],
    resources: [],
    tasks: [],
    guests: [],
    capacityConfirmed: false,
  };
}

function newIdempotencyKey(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `event-${Date.now()}-${rand}`;
}

function labelize(input: string): string {
  return input.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ').replaceAll('-', ' ');
}

function formatCents(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
  } catch {
    return `${cents} cents (${currency})`;
  }
}

function SummaryFacts({ value, currency }: { value: unknown; currency?: string }): React.ReactElement {
  if (value === null || value === undefined) return <span>Not supplied</span>;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return <span>{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span>None</span>;
    return (
      <ul>
        {value.slice(0, 100).map((item, index) => (
          <li key={index}>
            <SummaryFacts value={item} currency={currency} />
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const entries = Object.entries(record);
    if (entries.length === 0) return <span>None</span>;
    const maybeCurrency = record['currency'];
    const code = typeof maybeCurrency === 'string' && maybeCurrency !== '' ? maybeCurrency : currency;
    return (
      <dl>
        {entries.map(([key, entryValue]) => (
          <div key={key}>
            <dt>{labelize(key)}</dt>
            <dd>
              {key.endsWith('Cents') && typeof entryValue === 'number' && code !== undefined && code !== '' ? (
                <span>{formatCents(entryValue, code)}</span>
              ) : (
                <SummaryFacts value={entryValue} currency={code} />
              )}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return <span>Not supplied</span>;
}

function guestEvidenceIssues(draft: EventDraft): string[] {
  const issues: string[] = [];
  draft.guests.forEach((guest, index) => {
    if (guest.allergenStatus !== 'unknown') {
      if (guest.source.trim() === '' || guest.sourceVersion.trim() === '' || guest.reviewer.trim() === '') {
        const name = guest.id.trim() === '' ? `row ${index + 1}` : `row ${index + 1} (${guest.id})`;
        issues.push(`Guest ${name}: source, source version, and reviewer are required when status is not unknown.`);
      }
    }
  });
  return issues;
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Request failed';
}

export function EventPlanner({ onCreated }: EventPlannerProps): React.ReactElement {
  const [draft, setDraft] = useState<EventDraft>(defaultDraft);
  const [version, setVersion] = useState<number>(0);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [reloading, setReloading] = useState<boolean>(false);
  const [previewing, setPreviewing] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [reviewed, setReviewed] = useState<boolean>(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => newIdempotencyKey());
  const [created, setCreated] = useState<CreatedFlow | null>(null);

  const busy = saving || reloading || previewing || creating;

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      setInitialLoading(true);
      setError('');
      try {
        const res = await api<DraftResponse>('/api/job-drafts/event');
        if (cancelled) return;
        setVersion(res.version);
        if (res.version !== 0 && res.payload !== null) {
          setDraft(res.payload);
        }
      } catch (e) {
        if (!cancelled) setError(errorMessage(e));
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const touch = (next: EventDraft): void => {
    if(JSON.stringify(next.resources)!==JSON.stringify(draft.resources)||JSON.stringify(next.tasks)!==JSON.stringify(draft.tasks))next={...next,capacityConfirmed:false};
    setDraft(next);
    setCreated(null);
    setMessage('');
    setIdempotencyKey(newIdempotencyKey());
    setPreview(null);
    setReviewed(false);
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await api<DraftResponse>('/api/job-drafts/event', {
        method: 'POST',
        body: { expectedVersion: version, payload: draft },
      });
      setVersion(res.version);
      if (res.payload !== null) setDraft(res.payload);
      setMessage(`Unfinished event saved (revision ${res.version}).`);
    } catch (e) {
      setError(`Save failed: ${errorMessage(e)}. Your typed inputs were kept. Use Reload saved draft to recover on a version conflict.`);
    } finally {
      setSaving(false);
    }
  };

  const handleReload = async (): Promise<void> => {
    if (!window.confirm('Discard unsaved edits and reload the saved draft?')) return;
    setReloading(true);
    setError('');
    setMessage('');
    try {
      const res = await api<DraftResponse>('/api/job-drafts/event');
      setVersion(res.version);
      if (res.version !== 0 && res.payload !== null) {
        setDraft(res.payload);
      } else {
        setDraft(defaultDraft());
      }
      setIdempotencyKey(newIdempotencyKey());
      setPreview(null);
      setReviewed(false);
      setMessage(res.version === 0 ? 'No saved draft found; started a blank event.' : `Reloaded saved draft (revision ${res.version}).`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setReloading(false);
    }
  };

  const handlePreview = async (): Promise<void> => {
    setPreviewing(true);
    setError('');
    setMessage('');
    try {
      const res = await api<PreviewResponse>('/api/events/preview', {
        method: 'POST',
        body: { payload: draft },
      });
      setPreview(res);
      setMessage('Preview ready. Previewing never creates a run or tasks.');
    } catch (e) {
      setPreview(null);
      setError(errorMessage(e));
    } finally {
      setPreviewing(false);
    }
  };

  const handleCreate = async (): Promise<void> => {
    setCreating(true);
    setError('');
    setMessage('');
    try {
      const res = await api<CreatedFlow>('/api/events/create', {
        method: 'POST',
        body: { key: idempotencyKey, payload: draft },
      });
      setCreated(res);
      setIdempotencyKey(newIdempotencyKey());
      setReviewed(false);
      setMessage(`Event review created (${res.id}, ${res.status}). No order or message was sent.`);
      onCreated();
    } catch (e) {
      setError(`Create failed: ${errorMessage(e)}. Retry keeps the same key; editing inputs generates a new key.`);
    } finally {
      setCreating(false);
    }
  };

  const issues = guestEvidenceIssues(draft);
  const canCreate = preview !== null && reviewed && issues.length === 0 && !busy && !initialLoading;

  return (
    <section aria-label="Event planner"><fieldset className="event-editor" disabled={busy || initialLoading}>
      <h2>Plan an event</h2>
      <p>
        Record the supplied budget, capacity intervals, and guest evidence. Leave unknown costs and revenue blank — never enter 0
        for an unknown amount, and never invent guest confirmations or resource capacities.
      </p>

      {initialLoading ? <p role="status">Loading saved event draft…</p> : null}
      {error !== '' ? (
        <div className="status error" role="alert" aria-live="assertive">
          {error}
        </div>
      ) : null}
      {message !== '' ? (
        <div className="status ok" role="status" aria-live="polite">
          {message}
        </div>
      ) : null}

      <fieldset>
        <legend>Budget</legend>
        <label htmlFor="event-currency">Currency</label>
        <input
          id="event-currency"
          type="text"
          value={draft.currency}
          placeholder="e.g. USD"
          onChange={(e) => touch({ ...draft, currency: e.target.value })}
        />
        <label htmlFor="event-revenue">Expected revenue (leave blank when unknown)</label>
        <input
          id="event-revenue"
          type="text"
          inputMode="decimal"
          value={draft.revenue}
          placeholder="Blank when unknown"
          onChange={(e) => touch({ ...draft, revenue: e.target.value })}
        />
        <label htmlFor="event-total-guests">Total guests</label>
        <input
          id="event-total-guests"
          type="text"
          inputMode="numeric"
          value={draft.totalGuests}
          placeholder="Blank when unknown"
          onChange={(e) => touch({ ...draft, totalGuests: e.target.value })}
        />

        <fieldset>
          <legend>Cost rows</legend>
          <p>Unknown costs stay blank. Add or remove rows explicitly.</p>
          {draft.costs.length === 0 ? <p>No cost rows. Add one to record a supplied cost.</p> : null}
          {draft.costs.map((cost, index) => (
            <fieldset key={index}>
              <legend>Cost {index + 1}</legend>
              <label htmlFor={`event-cost-label-${index}`}>Label</label>
              <input
                id={`event-cost-label-${index}`}
                type="text"
                value={cost.label}
                onChange={(e) =>
                  touch({ ...draft, costs: draft.costs.map((c, j) => (j === index ? { ...c, label: e.target.value } : c)) })
                }
              />
              <label htmlFor={`event-cost-amount-${index}`}>Amount (leave blank when unknown)</label>
              <input
                id={`event-cost-amount-${index}`}
                type="text"
                inputMode="decimal"
                value={cost.amount}
                placeholder="Blank when unknown"
                onChange={(e) =>
                  touch({ ...draft, costs: draft.costs.map((c, j) => (j === index ? { ...c, amount: e.target.value } : c)) })
                }
              />
              <div style={{ marginTop: 8 }}>
                <button type="button" disabled={busy} onClick={() => touch({ ...draft, costs: draft.costs.filter((_, j) => j !== index) })}>
                  Remove cost {index + 1}
                </button>
              </div>
            </fieldset>
          ))}
          <div style={{ marginTop: 8 }}>
            <button type="button" disabled={busy} onClick={() => touch({ ...draft, costs: [...draft.costs, { label: '', amount: '' }] })}>
              Add cost row
            </button>
          </div>
        </fieldset>
      </fieldset>

      <fieldset>
        <legend>Capacity: resources</legend>
        <p>Leave capacity blank when unknown. Only supplied capacities are recorded.</p>
        {draft.resources.length === 0 ? <p>No resource rows yet.</p> : null}
        {draft.resources.map((resource, index) => (
          <fieldset key={index}>
            <legend>Resource {index + 1}</legend>
            <label htmlFor={`event-resource-id-${index}`}>Resource ID</label>
            <input
              id={`event-resource-id-${index}`}
              type="text"
              value={resource.id}
              onChange={(e) =>
                touch({ ...draft, resources: draft.resources.map((r, j) => (j === index ? { ...r, id: e.target.value } : r)) })
              }
            />
            <label htmlFor={`event-resource-capacity-${index}`}>Capacity (blank when unknown)</label>
            <input
              id={`event-resource-capacity-${index}`}
              type="text"
              inputMode="decimal"
              value={resource.capacity}
              placeholder="Blank when unknown"
              onChange={(e) =>
                touch({
                  ...draft,
                  resources: draft.resources.map((r, j) => (j === index ? { ...r, capacity: e.target.value } : r)),
                })
              }
            />
            <label htmlFor={`event-resource-unit-${index}`}>Unit</label>
            <input
              id={`event-resource-unit-${index}`}
              type="text"
              value={resource.unit}
              placeholder="e.g. covers, kg, trays"
              onChange={(e) =>
                touch({ ...draft, resources: draft.resources.map((r, j) => (j === index ? { ...r, unit: e.target.value } : r)) })
              }
            />
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                disabled={busy}
                onClick={() => touch({ ...draft, resources: draft.resources.filter((_, j) => j !== index) })}
              >
                Remove resource {index + 1}
              </button>
            </div>
          </fieldset>
        ))}
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => touch({ ...draft, resources: [...draft.resources, { id: '', capacity: '', unit: '' }] })}
          >
            Add resource row
          </button>
        </div>
      </fieldset>

      <fieldset>
        <legend>Capacity: task intervals</legend>
        <p>
          Start and end are text with an explicit offset, for example <code>2026-12-01T18:00:00-05:00</code> or{' '}
          <code>2026-12-02T01:00:00+00:00</code>. Do not guess a timezone; include the offset supplied for the event.
        </p>
        {draft.tasks.length === 0 ? <p>No task interval rows yet.</p> : null}
        {draft.tasks.map((task, index) => (
          <fieldset key={index}>
            <legend>Task interval {index + 1}</legend>
            <label htmlFor={`event-task-id-${index}`}>Task ID</label>
            <input
              id={`event-task-id-${index}`}
              type="text"
              value={task.id}
              onChange={(e) =>
                touch({ ...draft, tasks: draft.tasks.map((t, j) => (j === index ? { ...t, id: e.target.value } : t)) })
              }
            />
            <label htmlFor={`event-task-resource-${index}`}>Resource ID</label>
            <input
              id={`event-task-resource-${index}`}
              type="text"
              value={task.resourceId}
              onChange={(e) =>
                touch({ ...draft, tasks: draft.tasks.map((t, j) => (j === index ? { ...t, resourceId: e.target.value } : t)) })
              }
            />
            <label htmlFor={`event-task-start-${index}`}>Start (ISO with explicit offset)</label>
            <input
              id={`event-task-start-${index}`}
              type="text"
              value={task.start}
              placeholder="2026-12-01T18:00:00-05:00"
              onChange={(e) =>
                touch({ ...draft, tasks: draft.tasks.map((t, j) => (j === index ? { ...t, start: e.target.value } : t)) })
              }
            />
            <label htmlFor={`event-task-end-${index}`}>End (ISO with explicit offset)</label>
            <input
              id={`event-task-end-${index}`}
              type="text"
              value={task.end}
              placeholder="2026-12-01T22:00:00-05:00"
              onChange={(e) =>
                touch({ ...draft, tasks: draft.tasks.map((t, j) => (j === index ? { ...t, end: e.target.value } : t)) })
              }
            />
            <label htmlFor={`event-task-units-${index}`}>Units (blank when unknown)</label>
            <input
              id={`event-task-units-${index}`}
              type="text"
              inputMode="decimal"
              value={task.units}
              onChange={(e) =>
                touch({ ...draft, tasks: draft.tasks.map((t, j) => (j === index ? { ...t, units: e.target.value } : t)) })
              }
            />
            <label htmlFor={`event-task-unit-${index}`}>Unit</label>
            <input
              id={`event-task-unit-${index}`}
              type="text"
              value={task.unit}
              onChange={(e) =>
                touch({ ...draft, tasks: draft.tasks.map((t, j) => (j === index ? { ...t, unit: e.target.value } : t)) })
              }
            />
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                disabled={busy}
                onClick={() => touch({ ...draft, tasks: draft.tasks.filter((_, j) => j !== index) })}
              >
                Remove task interval {index + 1}
              </button>
            </div>
          </fieldset>
        ))}
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              touch({ ...draft, tasks: [...draft.tasks, { id: '', resourceId: '', start: '', end: '', units: '', unit: '' }] })
            }
          >
            Add task interval row
          </button>
        </div>
      </fieldset>

      <fieldset>
        <legend>Capacity confirmation</legend>
        <label>
          <input
            type="checkbox"
            checked={draft.capacityConfirmed}
            onChange={(e) => touch({ ...draft, capacityConfirmed: e.target.checked })}
          />{' '}
          Listed tasks and resources cover the supplied event workload
        </label>
        <p>
          Confirmation means the listed tasks and resources cover the supplied event workload. Empty or unconfirmed capacity stays
          blocked on the server; the blocked run can still be saved for review tasks.
        </p>
      </fieldset>

      <fieldset>
        <legend>Guests and dietary evidence</legend>
        <p>
          Requirements are comma separated supplied requirements, for example <code>nut allergy, halal</code>. Each guest row keeps its own
          allergen evidence status; one row is never a restaurant-wide allergen claim.
        </p>
        {draft.guests.length === 0 ? <p>No guest rows yet.</p> : null}
        {draft.guests.map((guest, index) => (
          <fieldset key={index}>
            <legend>Guest {index + 1}</legend>
            <label htmlFor={`event-guest-id-${index}`}>Guest ID</label>
            <input
              id={`event-guest-id-${index}`}
              type="text"
              value={guest.id}
              onChange={(e) =>
                touch({ ...draft, guests: draft.guests.map((g, j) => (j === index ? { ...g, id: e.target.value } : g)) })
              }
            />
            <label htmlFor={`event-guest-requirements-${index}`}>Requirements (comma separated)</label>
            <input
              id={`event-guest-requirements-${index}`}
              type="text"
              value={guest.requirements}
              placeholder="e.g. nut allergy, halal"
              onChange={(e) =>
                touch({ ...draft, guests: draft.guests.map((g, j) => (j === index ? { ...g, requirements: e.target.value } : g)) })
              }
            />
            <label htmlFor={`event-guest-status-${index}`}>Guest allergen evidence status (this guest row only)</label>
            <select
              id={`event-guest-status-${index}`}
              value={guest.allergenStatus}
              onChange={(e) =>
                touch({
                  ...draft,
                  guests: draft.guests.map((g, j) =>
                    j === index ? { ...g, allergenStatus: e.target.value as AllergenStatus } : g,
                  ),
                })
              }
            >
              <option value="unknown">unknown</option>
              <option value="contains">contains</option>
              <option value="may_contain">may contain</option>
              <option value="verified_absent">verified absent</option>
            </select>
            <p>Unknown rows can still create a blocked event. Any other status requires source, version, and reviewer below.</p>
            <label htmlFor={`event-guest-source-${index}`}>Source</label>
            <input
              id={`event-guest-source-${index}`}
              type="text"
              value={guest.source}
              onChange={(e) =>
                touch({ ...draft, guests: draft.guests.map((g, j) => (j === index ? { ...g, source: e.target.value } : g)) })
              }
            />
            <label htmlFor={`event-guest-source-version-${index}`}>Source version</label>
            <input
              id={`event-guest-source-version-${index}`}
              type="text"
              value={guest.sourceVersion}
              onChange={(e) =>
                touch({
                  ...draft,
                  guests: draft.guests.map((g, j) => (j === index ? { ...g, sourceVersion: e.target.value } : g)),
                })
              }
            />
            <label htmlFor={`event-guest-reviewer-${index}`}>Reviewer</label>
            <input
              id={`event-guest-reviewer-${index}`}
              type="text"
              value={guest.reviewer}
              onChange={(e) =>
                touch({ ...draft, guests: draft.guests.map((g, j) => (j === index ? { ...g, reviewer: e.target.value } : g)) })
              }
            />
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                disabled={busy}
                onClick={() => touch({ ...draft, guests: draft.guests.filter((_, j) => j !== index) })}
              >
                Remove guest {index + 1}
              </button>
            </div>
          </fieldset>
        ))}
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              touch({
                ...draft,
                guests: [
                  ...draft.guests,
                  { id: '', requirements: '', allergenStatus: 'unknown', source: '', sourceVersion: '', reviewer: '' },
                ],
              })
            }
          >
            Add guest row
          </button>
        </div>
      </fieldset>

      <div className="no-print" style={{ marginTop: 12 }}>
        <button type="button" disabled={busy || initialLoading} onClick={() => void handleSave()}>
          {saving ? 'Saving…' : 'Save unfinished event'}
        </button>{' '}
        <button type="button" disabled={busy || initialLoading} onClick={() => void handleReload()}>
          {reloading ? 'Reloading…' : 'Reload saved draft'}
        </button>{' '}
        <button type="button" className="primary" disabled={busy || initialLoading} onClick={() => void handlePreview()}>
          {previewing ? 'Reviewing…' : 'Review event inputs'}
        </button>
      </div>

      {preview !== null ? (
        <article aria-label="Event preview">
          <h3>Preview</h3>
          <p>Server conversion and numerical validation only. Previewing never creates a run or tasks.</p>
          {preview.blockers.length > 0 ? (
            <>
              <h4>Blockers ({preview.blockers.length})</h4>
              <ul>
                {preview.blockers.map((blocker, index) => (
                  <li key={index}>{blocker}</li>
                ))}
              </ul>
              <p>Blocked inputs can still be saved as a review run after this preview succeeds.</p>
            </>
          ) : (
            <p>No blockers returned.</p>
          )}
          <h4>Budget and capacity summary</h4>
          <SummaryFacts value={preview.summary} currency={draft.currency !== '' ? draft.currency : undefined} />
          <details>
            <summary>Technical preview details</summary>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {JSON.stringify({ blockers: preview.blockers, summary: preview.summary }, null, 2)}
            </pre>
          </details>
        </article>
      ) : (
        <p>Preview has not succeeded yet. Any edit invalidates the previous review and preview.</p>
      )}

      <fieldset>
        <legend>Create event review</legend>
        <p>
          Blocked but structurally valid runs can be created so review tasks are saved. Preview must succeed first, and blockers do
          not auto-approve anything. No order or message is sent.
        </p>
        {issues.length > 0 ? (
          <ul>
            {issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        ) : null}
        {preview === null ? <p>A successful preview is required before creating.</p> : null}
        <label>
          <input type="checkbox" checked={reviewed} disabled={busy} onChange={(e) => setReviewed(e.target.checked)} /> I reviewed
          these event inputs
        </label>
        <div style={{ marginTop: 8 }}>
          <button type="button" className="primary" disabled={!canCreate} onClick={() => void handleCreate()}>
            {creating ? 'Creating…' : 'Create event review'}
          </button>
        </div>
        {created !== null ? (
          <article aria-label="Created event review">
            <h4>Created review</h4>
            <p>
              <strong>{created.id}</strong> · {created.status}
            </p>
            {created.output.blockers.length > 0 ? (
              <ul>
                {created.output.blockers.map((blocker, index) => (
                  <li key={index}>{blocker}</li>
                ))}
              </ul>
            ) : (
              <p>No blockers on the created run.</p>
            )}
          </article>
        ) : null}
      </fieldset>

      <p>
        Draft revision: {version}. This unfinished event is saved in your local workspace. Attach AI-written narratives to the resulting review run.
      </p>
    </fieldset></section>
  );
}
