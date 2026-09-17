import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {getAdapter,findTargets,CdpSession} from './core/src/index.mjs';

const config=JSON.parse(await fs.readFile(new URL('../data/active-config.json',import.meta.url),'utf8'));
const [target]=await findTargets(getAdapter('codex'),9335);
assert.ok(target,'No Codex renderer');
const session=await new CdpSession(target).open();
try{
 const result=await session.evaluate(`(()=>{
  const row=document.querySelector('[data-app-shell-tab-row]:has([data-app-shell-tab-strip-controller="right"])');
  if(!row)throw Error('Open a file or browser tab in the right panel first');
  const tabs=[...row.querySelectorAll('[data-app-shell-tab-controller="right"] [data-tab-id][class~="group/tab"]')];
  return {blur:getComputedStyle(row).backdropFilter,tabs:tabs.map(e=>({background:getComputedStyle(e).backgroundColor,tint:getComputedStyle(e).getPropertyValue('--app-shell-tab-background').trim(),filter:getComputedStyle(e).filter,selected:e.querySelector('[role="tab"]')?.getAttribute('aria-selected')}))};
 })()`);
 assert.equal(result.blur,'blur('+config.workspaceHeaderBlur+'px)');
 assert.ok(result.tabs.length>0);
 const rgb=[1,3,5].map(n=>parseInt(config.ink.slice(n,n+2),16)).join(',');
 for(const tab of result.tabs){
  assert.equal(tab.background,'rgba(0, 0, 0, 0)');
  assert.equal(tab.tint,'rgba('+rgb+',0.1)');
  assert.equal(tab.filter,'none');
 }
 console.log(JSON.stringify({pass:true,...result}));
}finally{session.close();}
