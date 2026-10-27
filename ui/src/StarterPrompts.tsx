import React,{useEffect,useState} from 'react';
import {api} from './api';
type Starter={id:string;title:string;audience:string;prompt:string;steps:string[];workflowIds:string[]};
type GetStarted={starters:Starter[];introduction:string;fallback:string;boundaries:string[]};
export function StarterPrompts():React.ReactElement{
 const[data,setData]=useState<GetStarted|null>(null),[error,setError]=useState(''),[selectedId,setSelectedId]=useState(''),[copy,setCopy]=useState<'idle'|'copied'|'failed'>('idle');
 const load=()=>{setError('');api<GetStarted>('/api/get-started').then(j=>{setData(j);setSelectedId(prev=>j.starters.some(s=>s.id===prev)?prev:(j.starters[0]?.id??''));}).catch(e=>setError((e as Error).message));};
 useEffect(()=>{load();},[]);
 const selected=data?.starters.find(s=>s.id===selectedId)??data?.starters[0]??null;
 return<section aria-label="Start a kitchen job"><h2>Start a kitchen job</h2>
 {error&&<><p role="alert">{error}</p><p><button type="button" onClick={()=>{setCopy('idle');load();}}>Retry</button></p></>}
 {data?(selected?<><p>{data.introduction}</p>
 <label htmlFor="starter-select">Choose a starting point</label>
 <select id="starter-select" style={{width:'100%'}} value={selected.id} onChange={e=>{setSelectedId(e.target.value);setCopy('idle');}}>{data.starters.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
 <p>{selected.audience}</p>
 <label htmlFor="starter-prompt">Prompt to use in your AI</label>
 <textarea id="starter-prompt" style={{width:'100%'}} readOnly rows={8} value={selected.prompt}/>
 <ol>{selected.steps.map((step,i)=><li key={i}>{step}</li>)}</ol>
 <p><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(selected.prompt);setCopy('copied');}catch{setCopy('failed');}}}>Copy prompt</button></p>
 {copy!=='idle'&&<p role="status">{copy==='copied'?'Copied. Paste it into your chosen AI.':'Automatic copy failed. Select the prompt text and copy it manually.'}</p>}
 <details><summary>What if a skill is missing?</summary><p>{data.fallback}</p><ul>{data.boundaries.map(b=><li key={b}>{b}</li>)}</ul></details>
 </>:<p role="status">No starting points available.</p>):(!error&&<p role="status">Loading starting points…</p>)}
 </section>;
}
