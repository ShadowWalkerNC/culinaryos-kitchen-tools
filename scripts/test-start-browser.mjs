// Optional real-browser acceptance against an explicitly selected synthetic local workspace.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,mkdtempSync} from 'node:fs';
import {join} from 'node:path';import {tmpdir} from 'node:os';
import {startPublicServer} from '../dist/server/publicHttp.js';
const base=process.env.KITCHEN_BROWSER_URL??'http://127.0.0.1:3198';
const url=new URL(base);if(url.protocol!=='http:'||url.hostname!=='127.0.0.1'||url.username||url.password)throw Error('Use a loopback synthetic workspace');
const out=process.env.KITCHEN_BROWSER_OUTPUT??mkdtempSync(join(tmpdir(),'kitchen-start-browser-'));mkdirSync(out,{recursive:true});
const{chromium}=await import(process.env.KITCHEN_PLAYWRIGHT_MODULE??'playwright-core');
const publicServer=startPublicServer({port:32004,host:'127.0.0.1'});assert.equal(await publicServer.ready,true);
const publicBase='http://127.0.0.1:32004';const checks=[],pageErrors=[];
const browser=await chromium.launch({headless:true,...(process.env.KITCHEN_CHROME_EXECUTABLE?{executablePath:process.env.KITCHEN_CHROME_EXECUTABLE}:{channel:'chrome'})});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();page.setDefaultTimeout(7000);page.on('pageerror',error=>pageErrors.push(error.message));
 await page.goto(base+'/#/setup');const select=page.getByLabel('Choose a starting point',{exact:true});await select.waitFor();assert.equal(await select.locator('option').count(),12);
 await select.selectOption('care-menu');const prompt=page.getByLabel('Prompt to use in your AI',{exact:true});assert.match(await prompt.inputValue(),/Do not infer renal/);
 assert.equal(await page.getByRole('region',{name:'Start a kitchen job',exact:true}).locator('ol li').count(),4);
 await page.getByRole('button',{name:'Copy prompt',exact:true}).click();await page.getByText('Copied. Paste it into your chosen AI.',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),await prompt.inputValue());checks.push('Phone: all12 choices, care boundary, four steps and real clipboard copy');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:join(out,'start-phone.png')});
 await page.setViewportSize({width:1440,height:1000});await select.selectOption('bakery-day');assert.match(await prompt.inputValue(),/bakery orders/);await page.getByText('What if a skill is missing?',{exact:true}).click();await page.getByText(/If no matching workflow exists, answer with the regular AI/).waitFor();checks.push('Desktop: bakery journey and honest missing-skill fallback');await page.screenshot({path:join(out,'start-desktop.png')});
 await page.goto(publicBase);await page.getByText('Make recipe units consistent',{exact:true}).click();const volume=page.locator('#prompt-convert-recipe');await volume.waitFor();await page.locator('button[data-copy="prompt-convert-recipe"]').click();await page.getByText('Copied. Paste it into your chosen AI.',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),await volume.inputValue());checks.push('Public page: prompt copied through same-origin external script and CSP');
 assert.equal(await page.getByRole('link',{name:'Propose a skill or prompt',exact:true}).getAttribute('href'),'https://github.com/ShadowWalkerNC/culinaryos-kitchen-tools/issues/new?template=skill-proposal.yml');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);checks.push('Public phone layout and contribution link');
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('Synthetic denied clipboard'))},configurable:true});});await page.locator('button[data-copy="prompt-convert-recipe"]').click();await page.getByText(/Select and copy the prompt manually/).waitFor();checks.push('Clipboard refusal gives manual-copy fallback');
 assert.deepEqual(pageErrors,[]);writeFileSync(join(out,'results.json'),JSON.stringify({status:'PASS',checkedAt:new Date().toISOString(),checks,pageErrors,limits:'Local browser and public-page interaction; not native AI-client onboarding or model quality.'},null,2)+'\n');console.log(JSON.stringify({status:'PASS',checks,out}));
}finally{await browser.close();await publicServer.close();}
