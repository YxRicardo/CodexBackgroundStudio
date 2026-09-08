import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {getAdapter,findTargets,CdpSession,captureScreenshot} from './core/src/index.mjs';
const adapter=getAdapter('codex'),[target]=await findTargets(adapter,9335);
assert.ok(target,'Codex must be running with its summary open');
const session=await new CdpSession(target).open();
try {
 const result=await session.evaluate(`(()=>{
  const selector='.bg-surface-elevated-secondary.rounded-3xl:has([data-slot="thread-summary-panel-item-button"])';
  const cards=[...document.querySelectorAll(selector)].filter(e=>e.getBoundingClientRect().height>0&&e.checkVisibility({opacityProperty:true,visibilityProperty:true}));
  return cards.map(card=>{
   const s=getComputedStyle(card),r=card.getBoundingClientRect();
   return {background:s.backgroundColor,blur:s.backdropFilter,border:s.borderColor,rect:{x:r.x,y:r.y,width:r.width,height:r.height},
    headers:[...card.querySelectorAll('header.bg-surface-elevated-secondary')].map(e=>({background:getComputedStyle(e).backgroundColor,before:getComputedStyle(e,'::before').backgroundColor})),
    items:[...card.querySelectorAll('[data-slot="thread-summary-panel-item-button"]')].map(e=>({background:getComputedStyle(e).backgroundColor,blur:getComputedStyle(e).backdropFilter}))};
  });
 })()`);
 const config=JSON.parse(await fs.readFile(new URL('../data/active-config.json',import.meta.url),'utf8'));
 const rgb=[1,3,5].map(n=>parseInt(config.panel.slice(n,n+2),16)).join(', ');
 const expected=config.panelOpacity===100?'rgb('+rgb+')':'rgba('+rgb+', '+config.panelOpacity/100+')';
 assert.ok(result.length>0,'No visible native summary matched: open the upper-right pinned summary before running');
 for(const card of result){
  assert.equal(card.background,expected);
  assert.equal(card.blur,'blur('+config.workspaceHeaderBlur+'px)');
  for(const h of card.headers){assert.equal(h.background,'rgba(0, 0, 0, 0)');assert.equal(h.before,'rgba(0, 0, 0, 0)');}
  for(const item of card.items){assert.equal(item.background,'rgba(0, 0, 0, 0)');assert.equal(item.blur,'none');}
 }
 await fs.writeFile(new URL('../work/pinned-summary-verification.json',import.meta.url),JSON.stringify(result,null,2));
 await captureScreenshot({adapter,port:9335,output:new URL('../work/pinned-summary-after.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
 console.log(JSON.stringify({pass:true,cards:result},null,2));
} finally {session.close();}
