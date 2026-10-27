import React,{useEffect,useState} from 'react';
import {api} from './api';
import {KitchenSettings} from './KitchenWork';
import {StarterPrompts} from './StarterPrompts';
type Setup={version:string;nodeVersion:string;schemaVersion:number;missingSettings:string[];recipes:number;purchases:number;connectedRuns:number;publicEndpoint:string;worker:{state:string};clientStatus:string};
type Check={status:string;checks:string[];scope:string;error?:string;inputs?:string};
export function KitchenSetup():React.ReactElement{
 const[data,setData]=useState<Setup|null>(null),[error,setError]=useState(''),[check,setCheck]=useState<Check|null>(null),[busy,setBusy]=useState(false);
 const load=()=>api<Setup>('/api/setup').then(setData).catch(e=>setError(e.message));
 useEffect(()=>{load();window.addEventListener('kitchen-records-changed',load);return()=>window.removeEventListener('kitchen-records-changed',load);},[]);
 return<section aria-label="Kitchen setup"><StarterPrompts/><h2>Make this your kitchen workspace</h2><p>Start with one recipe and finish a useful job. Your records stay in this local workspace. You can return to this checklist at any time.</p>{error&&<p role="alert">{error}</p>}
 {data?<><ol className="setup-steps"><li><strong>Choose your kitchen settings.</strong> {data.missingSettings.length?`${data.missingSettings.length} settings remain unspecified; supply those needed for your work.`:'Kitchen settings supplied.'}<a href="#/settings">Open kitchen settings</a></li>
 <li><strong>Bring one recipe and its purchase prices.</strong> {data.recipes} recipes and {data.purchases} purchase records stored.<a href="#/imports">Review an import or try the labeled demo</a></li>
 <li><strong>Check the cost.</strong> The supplied demo soup should cost USD 1.50 per batch and USD 0.38 per serving. Its figures are synthetic.<a href="#/recipes">Open recipes and calculate</a></li>
 <li><strong>Prepare a recipe card and SOP.</strong> Start a recipe release, prepare the drafts in your chosen AI, then attach and review them. {data.connectedRuns} connected runs stored.<a href="#/today">Start a kitchen job</a></li></ol>
 <details><summary>Workspace health</summary><dl><dt>Toolkit</dt><dd>{data.version}</dd><dt>Local runtime</dt><dd>Node {data.nodeVersion} · workspace format {data.schemaVersion}</dd><dt>Rules worker</dt><dd>{data.worker.state}; enabled rules run while this workspace stays open</dd></dl></details>
 <section aria-label="AI connection check"><h3>Connect your chosen AI</h3><p>The public connection supplies guidance and calculations. Private records and tasks need a supported local connection. Your AI service may require its own account or paid plan.</p><p>Public MCP address:</p><code className="endpoint">{data.publicEndpoint}</code><p>{data.clientStatus}</p><p><a href="https://culinaryos-kitchen-tools-production.up.railway.app" target="_blank" rel="noreferrer">Choose ChatGPT, Claude, Cursor, Gemini CLI or Codex setup</a></p>
 <button disabled={busy} onClick={async()=>{setBusy(true);setError('');try{setCheck(await api<Check>('/api/setup/check-hosted',{method:'POST',body:{}}));}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>{busy?'Checking public service…':'Check public connection with synthetic data'}</button>
 {check&&<div role="status"><h4>{check.status==='pass'?'Public service check passed':'Public service check unavailable'}</h4><ul>{check.checks.map(c=><li key={c}>{c}</li>)}</ul>{check.error&&<p>{check.error}</p>}<p>{check.scope}</p><p>{check.inputs}</p></div>}
 <details><summary>If tools do not appear in your AI</summary><ol><li>Confirm that your exact AI product supports the chosen MCP connection type.</li><li>Check its connection status and tool permissions. Reconnect or restart it through its supported interface.</li><li>If the host requests approval, review that request in the host. A workspace service check cannot grant host permissions.</li><li>If live tools are unavailable, use the workflow library and manual playbook. Saving, calculation and automation are available only through an actual tool connection.</li></ol><p>Earlier Codex testing encountered a host approval block. Gemini CLI connected but its tested model session did not expose the tools. These are incomplete client checks, not proof of a successful installation.</p></details></section></>:<p role="status">Loading workspace checklist…</p>}
 <details><summary>Enter kitchen settings here</summary><KitchenSettings/></details>
 </section>;
}
