import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const {chromium}=await import(process.env.KITCHEN_PLAYWRIGHT_MODULE??'playwright-core');
const base=process.env.KITCHEN_BROWSER_URL??'http://127.0.0.1:3208';
if(new URL(base).hostname!=='127.0.0.1')throw Error('Use a loopback synthetic workspace');
const out=process.env.KITCHEN_BROWSER_OUTPUT;if(!out)throw Error('Set KITCHEN_BROWSER_OUTPUT');mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const results={checks:[],errors:[]};
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(6000);page.on('pageerror',e=>results.errors.push(e.message));
 await page.goto(base+'/#/menus');await page.getByRole('heading',{name:'Menu studio',exact:true}).waitFor();
 for(const template of ['restaurant','counter','bakery','prix-fixe']){await page.getByLabel('Preset template',{exact:true}).selectOption(template);await page.getByRole('button',{name:'Load blank section boilerplate',exact:true}).click();assert.ok((await page.getByLabel('Section heading',{exact:true}).evaluateAll(nodes=>nodes.map(n=>n.value))).every(Boolean));assert.ok((await page.getByLabel('Dish name',{exact:true}).evaluateAll(nodes=>nodes.map(n=>n.value))).every(v=>v===''));}results.checks.push('Four boilerplates supply headings without invented dishes');await page.reload();
 await page.getByLabel('Menu title',{exact:true}).fill('Synthetic dinner menu');await page.getByLabel('Business name',{exact:true}).fill('Template demonstration');await page.getByLabel('Currency code',{exact:true}).fill('USD');await page.getByLabel('Section heading',{exact:true}).fill('Main dishes');await page.getByLabel('Dish name',{exact:true}).fill('Roasted squash');await page.getByLabel('Short description',{exact:true}).fill('Lemon and herbs');await page.getByLabel('Item price',{exact:true}).fill('12.50');
 await page.getByRole('button',{name:'Preview menu',exact:true}).click();const frame=page.frameLocator('iframe');await frame.getByText('$12.50',{exact:true}).waitFor();
 assert.ok(await page.getByRole('button',{name:'Print / save PDF',exact:true}).isDisabled());await page.getByRole('checkbox').check();assert.ok(await page.getByRole('button',{name:'Print / save PDF',exact:true}).isEnabled());results.checks.push('Confirmed preview unlocks print');
 await page.screenshot({path:join(out,'desktop.png'),fullPage:true});
 await frame.locator('body').screenshot({path:join(out,'menu-preview.png')});
 const previewHtml=await frame.locator('html').evaluate(n=>n.outerHTML);const printPage=await browser.newPage();await printPage.setContent(previewHtml);await printPage.pdf({path:join(out,'synthetic-menu.pdf'),format:'Letter',printBackground:true});await printPage.close();results.checks.push('Fixed layout produces a printable PDF');
 await page.getByLabel('Item price',{exact:true}).fill('');assert.equal(await page.getByRole('checkbox').count(),0);await page.getByRole('button',{name:'Preview menu',exact:true}).click();await page.getByText('Price unresolved: Roasted squash',{exact:true}).waitFor();await page.getByRole('checkbox').check();assert.ok(await page.getByRole('button',{name:'Print / save PDF',exact:true}).isDisabled());results.checks.push('Changed or missing prices invalidate reviewed output and block print');
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:join(out,'phone-blocked.png'),fullPage:true});results.checks.push('Phone has no horizontal page overflow');
 await page.getByLabel('Menu title',{exact:true}).fill('Dinner 🍔');await page.getByRole('button',{name:'Preview menu',exact:true}).click();await page.getByRole('alert').filter({hasText:'decorative emoji'}).waitFor();results.checks.push('Emoji input rejected with visible validation');
 assert.deepEqual(results.errors,[]);results.status='PASS';
}catch(e){results.status='FAIL';results.error=e.stack;process.exitCode=1;}finally{await browser.close();writeFileSync(join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));}
