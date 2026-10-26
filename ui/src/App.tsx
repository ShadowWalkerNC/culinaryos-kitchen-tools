import React, { useEffect, useState, useRef } from 'react';
import { api } from './api';
import Workflows from './Workflows';
import {KitchenSettings,WorkflowLibrary} from './KitchenWork';

type Recipe = { id: string; name: string; currency: string; yieldQty: { amount: string; unit: string }; ingredients: Array<{ ingredientId: string; qty: { amount: string; unit: string } }>; version: number };
type Task = { id: string; title: string; state: string; blockedReason?: string; cancellation?: string };
type Approval = { id: string; objectType: string; objectId: string; objectVersion: number; state: string };
type Cost={recipeId:string;currency:string;knownCents:number;perUnitCents?:number;packagingCents:number;unknown:Array<{path:string;reason:string}>};
type Preview={token:string;records:number;missing:string[];conflicts:Array<{id:string;currentVersion:number|null}>;items?:Array<{id:string;label:string;summary:string}>};

export const DEMO_RECIPE_JSON = JSON.stringify([
  { id: 'demo_soup', name: 'DEMO Soup (synthetic)', currency: 'USD', yieldQty: { amount: '4', unit: 'serving' }, ingredients: [{ ingredientId: 'demo_carrot', qty: { amount: '0.5', unit: 'kg' } }], subrecipes: [] },
]);
export const DEMO_PURCHASE_JSON = JSON.stringify([
  { id: 'demo_buy_carrot', ingredientId: 'demo_carrot', currency: 'USD', costCents: 300, usableQty: { amount: '1', unit: 'kg' }, effectiveDate: '2026-01-01' },
]);

function useHash(): string {
  const [h, setH] = useState(window.location.hash || '#/recipes');
  useEffect(() => {
    const fn = (): void => setH(window.location.hash || '#/recipes');
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);
  return h;
}

function Status({ msg, err }: { msg: string; err: string }): React.ReactElement {
  if (err !== '') return <div className="status error" role="alert" aria-live="assertive">{err}</div>;
  if (msg !== '') return <div className="status ok" role="status" aria-live="polite">{msg}</div>;
  return <></>;
}

function Recipes(): React.ReactElement {
  const [rows, setRows] = useState<Recipe[]>([]);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [cost, setCost] = useState<Cost|null>(null);
  const money=(value:number)=>new Intl.NumberFormat(undefined,{style:'currency',currency:cost?.currency??'USD'}).format(value/100);
  const load = (): void => {
    setErr('');
    api<Recipe[]>('/api/recipes').then(setRows).catch((e: Error) => setErr(e.message));
  };
  useEffect(load, []);
  return (
    <section aria-label="Recipes">
      <h2>Recipes</h2>
      <div className="no-print">
        <button onClick={load}>Refresh</button>{' '}
        <button onClick={() => window.print()}>Print</button>{' '}
        <button onClick={() => { api<{ file: string }>('/api/exports', { method: 'POST', body: { format: 'recipe-cards', file: `exports/recipe-cards-${Date.now()}.md` } }).then((r) => setMsg(`Exported ${r.file}`)).catch((e: Error) => setErr(e.message)); }}>Export cards</button>
        <button onClick={() => { api<{ file: string }>('/api/exports', { method: 'POST', body: { format: 'cost-sheets', file: `exports/cost-sheets-${Date.now()}.json` } }).then((r) => setMsg(`Exported ${r.file}`)).catch((e: Error) => setErr(e.message)); }}>Export cost sheets</button>
      </div>
      <Status msg={msg} err={err} />
      {rows.length === 0 ? (
        <p>Empty workspace — no recipes yet. Import data to begin. This app is local-only and not connected to any external service.</p>
      ) : (
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Yield</th><th>Version</th><th>Cost</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}{r.id.startsWith('demo_') ? <> <span className="demo-badge">DEMO synthetic</span></> : null}</td>
                <td>{r.name}</td>
                <td>{r.yieldQty.amount} {r.yieldQty.unit}</td>
                <td>{r.version}</td>
                <td><button onClick={() => { api<Cost>(`/api/recipes/${encodeURIComponent(r.id)}/cost`).then(setCost).catch((e: Error) => setErr(e.message)); }}>Cost</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {cost ? <article aria-label="Cost analysis"><h3>{rows.find(r=>r.id===cost.recipeId)?.name}</h3><p>Known ingredient cost per batch: <strong>{money(cost.knownCents)}</strong></p><p>Cost per yield unit: <strong>{cost.perUnitCents===undefined?'Not available until missing inputs are resolved':money(cost.perUnitCents)}</strong></p><p>Packaging per batch: {money(cost.packagingCents)}. Labor, overhead and unrecorded waste are not included.</p>{cost.unknown.length>0&&<><h4>Inputs to resolve</h4><ul>{cost.unknown.map((u,i)=><li key={i}>{u.path}: {u.reason}</li>)}</ul></>}<p>Based on stored purchase records. Verify current invoices before changing a price.</p></article> : null}
    </section>
  );
}

function Imports(): React.ReactElement {
  const revision=useRef(0);
  const [kind, setKind] = useState('recipe_json');
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<Preview|null>(null);
  const [token, setToken] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const invalidate=()=>{revision.current++;setToken('');setPreview(null);setConfirm(false);};
  return (
    <section aria-label="Imports">
      <h2>Imports</h2>
      <p>Import structured recipe or purchase files. For menu photos or PDFs, ask your AI client to extract a draft first, then review it here. Pasted notes are retained as unverified source text.</p>
      <label htmlFor="import-file">Choose a local file</label><input id="import-file" type="file" accept=".json,.csv,.txt" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>1_000_000){setErr('Choose a file smaller than 1 MB.');return;}invalidate();setText(await file.text());invalidate();}}/>
      <Status msg={msg} err={err} />
      <label htmlFor="kind">Import kind</label>
      <select id="kind" value={kind} onChange={(e) => {invalidate();setKind(e.target.value);}}>
        <option value="recipe_json">Recipe JSON</option>
        <option value="purchase_json">Purchase JSON</option>
        <option value="recipe_csv">Recipe CSV</option>
        <option value="purchase_csv">Purchase CSV</option>
        <option value="pasted_text">Pasted text (kept unverified)</option>
      </select>
      <label htmlFor="payload">File contents or extracted draft</label>
      <textarea id="payload" value={text} onChange={(e) => {invalidate();setText(e.target.value);}} placeholder="Choose a file or paste the structured recipe or purchase draft from your AI client." />
      <div className="no-print" style={{ marginTop: 8 }}>
        <button className="primary" onClick={() => { invalidate();const epoch=revision.current;setErr(''); setMsg(''); api<Preview>('/api/imports/preview', { method: 'POST', body: { kind, payloadText: text } }).then((p) => { if(epoch!==revision.current)return;setPreview(p); setToken(p.records>0?p.token:'');setConfirm(false); setMsg('Preview ready — review the records before saving.'); }).catch((e: Error) => {if(epoch===revision.current)setErr(e.message);}); }}>Preview</button>{' '}
        <button onClick={() => { invalidate();setText(DEMO_RECIPE_JSON); setKind('recipe_json'); setMsg('Loaded labeled synthetic demo fixture (not real data).'); }}>Load demo recipe</button>{' '}
        <button onClick={() => { invalidate();setText(DEMO_PURCHASE_JSON); setKind('purchase_json'); setMsg('Loaded labeled synthetic demo fixture (not real data).'); }}>Load demo purchase</button>
      </div>
      {preview ? <article><h3>{preview.records} records ready for review</h3>{preview.missing.map((m,i)=><p key={i}>{m}</p>)}{preview.items?.length?<table><thead><tr><th>Record</th><th>Details</th><th>Existing version</th></tr></thead><tbody>{preview.items.map(item=><tr key={item.id}><td>{item.label}</td><td>{item.summary}</td><td>{preview.conflicts.find(c=>c.id===item.id)?.currentVersion??'New record'}</td></tr>)}</tbody></table>:null}</article> : null}
      {token !== '' ? (
        <div>
          <label><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} /> I reviewed the preview and confirm commit</label>
          <button className="primary" disabled={!confirm} onClick={() => { api<{committed:string[]}>('/api/imports/commit', { method: 'POST', body: { token, confirm: true } }).then((r) => { setMsg(`Saved ${r.committed.length} reviewed records.`); setToken(''); setConfirm(false); }).catch((e: Error) => setErr(e.message)); }}>Save reviewed records</button>
        </div>
      ) : null}
    </section>
  );
}

function Today(): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [err, setErr] = useState('');
  const load = (): void => {
    api<Task[]>('/api/tasks').then(setTasks).catch((e: Error) => setErr(e.message));
  };
  useEffect(()=>{load();const timer=setInterval(load,15000);window.addEventListener('kitchen-records-changed',load);return()=>{clearInterval(timer);window.removeEventListener('kitchen-records-changed',load);};}, []);
  return (
    <section aria-label="Today">
      <h2>Today — tasks</h2>
      <Workflows />
      {err !== '' ? <div className="status error" role="alert">{err}</div> : null}
      <label htmlFor="task">New task</label>
      <input id="task" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
      <div style={{ marginTop: 8 }}><button className="primary" onClick={() => { api('/api/tasks', { method: 'POST', body: { title } }).then(() => { setTitle(''); load(); }).catch((e: Error) => setErr(e.message)); }}>Add task</button>{' '}<button onClick={load}>Refresh</button></div>
      {tasks.length === 0 ? <p>No tasks. Nothing scheduled — enable schedules explicitly in worker config.</p> : (
        <table>
          <thead><tr><th>Title</th><th>State</th><th>Advance</th></tr></thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.state}{t.blockedReason ? ` (blocked: ${t.blockedReason})` : ''}{t.cancellation ? ` (cancelled: ${t.cancellation})` : ''}</td>
                <td>
                  <select aria-label={`state for ${t.title}`} value={t.state} onChange={(e) => { api(`/api/tasks/${t.id}/state`, { method: 'POST', body: { state: e.target.value } }).then(load).catch((er: Error) => setErr(er.message)); }}>
                    <option value="open">open</option>
                    <option value="in_progress">in_progress</option>
                    <option value="awaiting_approval">awaiting_approval</option>
                    <option value="completed">completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function Approvals(): React.ReactElement {
  const [rows, setRows] = useState<Approval[]>([]);
  const [objType, setObjType] = useState('recipe');
  const [objId, setObjId] = useState('');
  const [err, setErr] = useState('');
  const load = (): void => {
    api<Approval[]>('/api/approvals').then(setRows).catch((e: Error) => setErr(e.message));
  };
  useEffect(load, []);
  return (
    <section aria-label="Approvals">
      <h2>Approvals</h2>
      {err !== '' ? <div className="status error" role="alert">{err}</div> : null}
      <p>Approvals bind the exact object version. Stale approvals fail and must be re-requested.</p>
      <label htmlFor="otype">Object type</label>
      <select id="otype" value={objType} onChange={(e) => setObjType(e.target.value)}>
        <option value="recipe">recipe</option>
        <option value="purchase">purchase</option>
      </select>
      <label htmlFor="oid">Object ID</label>
      <input id="oid" type="text" value={objId} onChange={(e) => setObjId(e.target.value)} />
      <div style={{ marginTop: 8 }}><button className="primary" onClick={() => { api('/api/approvals/request', { method: 'POST', body: { objectType: objType, objectId: objId } }).then(() => { setObjId(''); load(); }).catch((e: Error) => setErr(e.message)); }}>Request approval</button>{' '}<button onClick={load}>Refresh</button></div>
      {rows.length === 0 ? <p>No approvals requested.</p> : (
        <table>
          <thead><tr><th>Object</th><th>Version</th><th>State</th><th>Decide</th></tr></thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>{a.objectType} {a.objectId}</td>
                <td>{a.objectVersion}</td>
                <td>{a.state}</td>
                <td>{a.state === 'pending' ? (<><button onClick={() => { api('/api/approvals/decide', { method: 'POST', body: { id: a.id, approve: true } }).then(load).catch((e: Error) => setErr(e.message)); }}>Approve</button>{' '}<button onClick={() => { api('/api/approvals/decide', { method: 'POST', body: { id: a.id, approve: false } }).then(load).catch((e: Error) => setErr(e.message)); }}>Reject</button></>) : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default function App(): React.ReactElement {
  const h = useHash();
  const tab = h === '#/settings' ? 'settings' : h === '#/library' ? 'library' : h === '#/imports' ? 'imports' : h === '#/today' ? 'today' : h === '#/approvals' ? 'approvals' : 'recipes';
  return (
    <>
      <header className="top"><h1>Open Kitchen Toolkit</h1></header>
      <nav className="tabs" aria-label="Views">
        <a href="#/recipes" aria-current={tab === 'recipes' ? 'page' : undefined}>Recipes</a>
        <a href="#/imports" aria-current={tab === 'imports' ? 'page' : undefined}>Imports</a>
        <a href="#/today" aria-current={tab === 'today' ? 'page' : undefined}>Today</a>
        <a href="#/approvals" aria-current={tab === 'approvals' ? 'page' : undefined}>Approvals</a>
        <a href="#/library" aria-current={tab === 'library' ? 'page' : undefined}>Library</a>
        <a href="#/settings" aria-current={tab === 'settings' ? 'page' : undefined}>Settings</a>
      </nav>
      <main>
        {tab === 'settings' ? <KitchenSettings /> : tab === 'library' ? <WorkflowLibrary /> : tab === 'recipes' ? <Recipes /> : tab === 'imports' ? <Imports /> : tab === 'today' ? <Today /> : <Approvals />}
      </main>
    </>
  );
}
